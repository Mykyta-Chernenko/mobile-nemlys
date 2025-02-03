import json
import logging
import os
import signal
import sys

import psycopg2
from psycopg2.extras import execute_batch, execute_values

logging.basicConfig(
    level=logging.INFO,
    format='[%(levelname)s] %(asctime)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

DB_NAME = os.environ.get("DB_NAME")
DB_USER = os.environ.get("DB_USER")
DB_HOST = os.environ.get("DB_HOST")
DB_PASSWORD = os.environ.get("DB_PASSWORD")
DB_PORT = os.environ.get("DB_PORT")

JOBS = [
    "getting_to_know_partner", "having_fun_and_entertainment",
    "having_and_discussing_sex", "understanding_mutual_compatibility",
    "improving_communication", "solving_relationship_problems",
    "having_meaningful_conversations", "discussing_difficult_topics",
    "planning_for_future", "building_trust", "overcoming_differences",
    "improving_relationship_satisfaction", "exploring_feelings",
    "having_new_experiences", "preparing_for_cohabitation",
    "preparing_for_intimacy", "discussing_religions",
    "improving_honesty_and_openness", "learning_relationship_skills",
    "discussing_finances", "enhancing_love_and_affection",
    "rekindling_passion", "introducing_healthy_habits",
    "preparing_for_children", "preparing_for_marriage"
]

FINISHED_LANGUAGES = [
 "en",  "uk",
                 "es", "nl", "it", "fr", "ar",
                     "bn", "zh_cn", "zh_tw",
                                  "zh_hk", "hi",
                                   "ja", "pt", "fil", "id",
                                   "pl", "ro",  "ru",
                                   "vi", "no", "af", "sq", "de",
                                   "tr", "am", "hy", "az",

                                   "eu", "be", "bg", "my", "ca",
                                   "hr", "cs", "da", "et", "fi", "gl", "ka", "el", "gu",
                                   "he", "hu", "is", "kn", "kk", "km", "ko", "ky", "lv", "lt", "mk", "ms", "ml", "mr", "mn",
                                   "ne", "fa", "pa", "rm", "sr", "si", "sk", "sl", "sw", "sv", "ta", "te",
                                   "th", "ur", "zu"
]

LANGUAGES = [
]


def load_json_files(base_dir):
    data = []
    if os.path.exists(base_dir):
        file_path = os.path.join(base_dir, "final_content.json")
        if os.path.exists(file_path):
            logging.info(f"Loading JSON from {file_path}")
            with open(file_path, 'r', encoding='utf-8') as infile:
                d = json.load(infile)
                if isinstance(d, list):
                    data.extend(d)
                else:
                    data.append(d)
    return data


def insert_jobs(cursor):
    logging.info("Inserting jobs if they do not exist.")
    cursor.execute("select slug from job;")
    existing = {r[0] for r in cursor.fetchall()}
    to_insert = [(j,) for j in JOBS if j not in existing]
    if to_insert:
        logging.info(f"Inserting {len(to_insert)} new jobs.")
        execute_batch(cursor, "insert into job (slug) values (%s)", to_insert)
    else:
        logging.info("No new jobs to insert.")


def insert_questions(cursor, data, lang):
    logging.info(f"Inserting {len(data)} questions for language {lang}.")
    if not data:
        return
    rows = [(q.get("slug"), lang, q.get("title")) for q in data]
    query = """
        insert into content_question (slug, language, content) values %s
        on conflict (slug, language) do nothing
    """
    execute_values(cursor, query, rows, page_size=1000)

    # fetch inserted ids
    inserted_slugs = [r[0] for r in rows]
    cursor.execute(
        "select id, slug from content_question where language=%s and slug = any(%s)",
        (lang, inserted_slugs)
    )
    q_id_map = {row[1]: row[0] for row in cursor.fetchall()}

    job_question_rows = []
    for q in data:
        slug = q.get("slug")
        jobs = list(set(q.get("job", [])))
        for jb in jobs:
            job_question_rows.append((jb, q_id_map[slug]))

    execute_values(cursor, "insert into job_content_question (job_slug, content_question_id) values %s",
                   job_question_rows)


def insert_articles(cursor, data, lang):
    logging.info(f"Inserting {len(data)} articles for language {lang}.")
    if not data:
        return
    article_rows = [(a.get("slug"), lang, a.get("title", ""), a.get("test_question", ""), a.get("content", "")[:300])
                    for a in data]
    cursor.execute(
        "create temporary table tmp_article (slug text, language text, title text, test_question text, preview text) on commit drop;")
    execute_values(cursor, "insert into tmp_article (slug, language, title, test_question, preview) values %s",
                   article_rows)
    cursor.execute("""
        insert into content_article (slug, language, title, test_question, preview)
        select slug, language, title, test_question, preview from tmp_article
        returning id, slug;
    """)
    article_id_map = {row[1]: row[0] for row in cursor.fetchall()}

    details_rows = []
    answers_rows = []
    for a in data:
        slug = a.get("slug")
        article_id = article_id_map.get(slug)
        content = a.get("content", "")
        details_rows.append((article_id, lang, content))
        all_answers = a.get("all_answers", [])
        correct_answer = a.get("correct_answer", "")
        for ans in all_answers:
            answers_rows.append((article_id, lang, ans, ans, ans == correct_answer))

    execute_values(cursor, """
        insert into content_article_details (article_id, language, content) values %s
    """, details_rows)
    execute_values(cursor, """
    insert into content_article_answer (article_id, language, title, content, correct) values %s
    """, answers_rows)

    # insert jobs for articles
    article_job_rows = []
    for a in data:
        slug = a.get("slug")
        jobs = a.get("job", [])
        for jb in jobs:
            article_job_rows.append((jb, article_id_map[slug]))
    execute_values(cursor, "insert into job_content_article (job_slug, content_article_id) values %s", article_job_rows)


def insert_exercises(cursor, data, lang):
    logging.info(f"Inserting {len(data)} exercises for language {lang}.")
    if not data:
        return
    ex_rows = [(e.get("slug"), lang, e.get("title", ""), e.get("purpose", "")) for e in data]
    cursor.execute(
        "create temporary table tmp_exercise (slug text, language text, title text, description text) on commit drop;")
    execute_values(cursor, "insert into tmp_exercise (slug, language, title, description) values %s", ex_rows)
    cursor.execute("""
        insert into content_exercise (slug, language, title, description)
        select slug, language, title, description from tmp_exercise
        returning id, slug;
    """)
    ex_id_map = {row[1]: row[0] for row in cursor.fetchall()}

    step_rows = []
    for e in data:
        slug = e.get("slug")
        exercise_id = ex_id_map.get(slug)
        steps = e.get("steps", [])
        for s in steps:
            stitle = s.get("title", "")
            sdesc = s.get("description", "")
            step_rows.append((exercise_id, lang, stitle, sdesc))

    execute_values(cursor, """
        insert into content_exercise_step (exercise_id, language, title, content) values %s
    """, step_rows)

    # insert jobs for exercises
    exercise_job_rows = []
    for e in data:
        slug = e.get("slug")
        jobs = e.get("job", [])
        for jb in jobs:
            exercise_job_rows.append((jb, ex_id_map[slug]))

    execute_values(cursor, "insert into job_content_exercise (job_slug, content_exercise_id) values %s",
                   exercise_job_rows)


def insert_checkups(cursor, data, lang):
    logging.info(f"Inserting {len(data)} checkups for language {lang}.")
    if not data:
        return
    c_rows = [(c.get("slug", ""), lang, c.get("title", ""), c.get("description", ""), c.get("research", "")) for c in
              data]
    cursor.execute(
        "create temporary table tmp_checkup (slug text, language text, title text, description text, research text) on commit drop;")
    execute_values(cursor, "insert into tmp_checkup (slug, language, title, description, research) values %s", c_rows)
    cursor.execute("""
        insert into content_checkup (slug, language, title, description, research)
        select slug, language, title, description, research from tmp_checkup
        returning id, slug;
    """)
    c_id_map = {row[1]: row[0] for row in cursor.fetchall()}

    q_rows = []
    for c in data:
        cid = c_id_map.get(c.get("slug", ""))
        for qq in c.get("questions", []):
            q_rows.append((cid, lang, qq))
    execute_values(cursor, """
        insert into content_checkup_question (checkup_id, language, content) values %s
    """, q_rows)

    # insert jobs for checkups
    checkup_job_rows = []
    for c in data:
        slug = c.get("slug")
        jobs = c.get("job", [])
        for jb in jobs:
            checkup_job_rows.append((jb, c_id_map[slug]))
    execute_values(cursor, "insert into job_content_checkup (job_slug, content_checkup_id) values %s", checkup_job_rows)


def insert_games(cursor, data, lang):
    logging.info(f"Inserting {len(data)} games for language {lang}.")
    if not data:
        return
    g_rows = [(g.get("slug", ""), lang, g.get("title", ""), g.get("description", "")) for g in data]
    cursor.execute(
        "create temporary table tmp_game (slug text, language text, title text, description text) on commit drop;")
    execute_values(cursor, "insert into tmp_game (slug, language, title, description) values %s", g_rows)
    cursor.execute("""
        insert into content_game (slug, language, title, description)
        select slug, language, title, description from tmp_game
        returning id, slug;
    """)
    g_id_map = {row[1]: row[0] for row in cursor.fetchall()}

    temp_ques = []
    game_option_all = []
    for g in data:
        gid = g_id_map.get(g.get("slug", ""))
        for q in g.get("questions", []):
            qtitle = q.get("question", "")
            temp_ques.append((gid, lang, qtitle))

    cursor.execute("create temporary table tmp_game_question (game_id int, language text, title text) on commit drop;")
    execute_values(cursor, "insert into tmp_game_question (game_id, language, title) values %s", temp_ques)
    cursor.execute("""
        insert into content_game_question (game_id, language, title)
        select game_id, language, title from tmp_game_question
        returning id, game_id, title
    """)
    gq_map = {(r[1], r[2]): r[0] for r in cursor.fetchall()}

    for g in data:
        gid = g_id_map.get(g.get("slug", ""))
        for q in g.get("questions", []):
            qtitle = q.get("question", "")
            qid = gq_map.get((gid, qtitle))
            for opt in q.get("options", []):
                game_option_all.append((qid, lang, opt))

    execute_values(cursor, """
        insert into content_game_question_option (game_question_id, language, title) values %s
    """, game_option_all)

    # insert jobs for games
    game_job_rows = []
    for g in data:
        slug = g.get("slug")
        jobs = g.get("job", [])
        for jb in jobs:
            game_job_rows.append((jb, g_id_map[slug]))
    execute_values(cursor, "insert into job_content_game (job_slug, content_game_id) values %s", game_job_rows)


def insert_tests(cursor, data, lang):
    logging.info(f"Inserting {len(data)} tests for language {lang}.")
    if not data:
        return
    t_rows = [(t.get("slug", ""), lang, t.get("title", ""), t.get("research", ""), t.get("description", "")) for t in
              data]
    cursor.execute(
        "create temporary table tmp_test (slug text, language text, title text, research text, description text) on commit drop;")
    execute_values(cursor, "insert into tmp_test (slug, language, title, research, description) values %s", t_rows)
    cursor.execute("""
        insert into content_test (slug, language, title, research, description)
        select slug, language, title, research, description from tmp_test
        returning id, slug;
    """)
    t_id_map = {row[1]: row[0] for row in cursor.fetchall()}

    all_results = []
    result_id_map = {}
    for t in data:
        test_id = t_id_map.get(t.get("slug", ""))
        oi = t.get("outcome_interpretation", {})
        for key, val in oi.items():
            label = val.get("label", "")
            desc = val.get("description", "")
            adv = val.get("advice", "")
            all_results.append((test_id, lang, label, desc, adv, key))
    cursor.execute(
        "create temporary table tmp_result (test_id int, language text, title text, description text, advice text, outcome_key text) on commit drop;")
    execute_values(cursor,
                   "insert into tmp_result (test_id, language, title, description, advice, outcome_key) values %s",
                   all_results)
    cursor.execute("""
        insert into content_test_result (test_id, language, title, description, advice)
        select test_id, language, title, description, advice from tmp_result
        returning id, test_id, title, (select outcome_key from tmp_result where tmp_result.title=content_test_result.title and tmp_result.description = content_test_result.description and tmp_result.advice = content_test_result.advice  and tmp_result.test_id = content_test_result.test_id  limit 1)
    """)
    for row in cursor.fetchall():
        rid, tid, rtitle, outcome_key = row
        result_id_map[(tid, outcome_key)] = rid

    test_questions = []
    for t in data:
        tid = t_id_map.get(t.get("slug", ""))
        for qq in t.get("questions", []):
            qtitle = qq.get("question", "")
            test_questions.append((tid, lang, qtitle))
    cursor.execute("create temporary table tmp_test_question (test_id int, language text, title text) on commit drop;")
    execute_values(cursor, "insert into tmp_test_question (test_id, language, title) values %s", test_questions)
    cursor.execute("""
        insert into content_test_question (test_id, language, title)
        select test_id, language, title from tmp_test_question
        returning id, test_id, title
    """)
    tq_map = {(r[1], r[2]): r[0] for r in cursor.fetchall()}

    test_question_options = []
    for t in data:
        tid = t_id_map.get(t.get("slug", ""))
        oi = t.get("outcome_interpretation", {})
        for qq in t.get("questions", []):
            qtitle = qq.get("question", "")
            qid = tq_map.get((tid, qtitle))
            opts = qq.get("options", [])
            for i, opt in enumerate(opts, start=1):
                res_id = result_id_map.get((tid, str(i)))
                test_question_options.append((qid, lang, opt, res_id))
    execute_values(cursor, """
        insert into content_test_question_option (question_id, language, title, result_id) values %s
    """, test_question_options)

    combination_rows = []
    for t in data:
        tid = t_id_map.get(t.get("slug", ""))
        combination = t.get("combination", {})
        for comb_key, comb_val in combination.items():
            cdesc = comb_val.get("description", "")
            cadv = comb_val.get("advice", "")
            parts = comb_key.split("_")
            k1, k2 = parts
            r1_id = result_id_map.get((tid, k1))
            r2_id = result_id_map.get((tid, k2))
            r_low = min(r1_id, r2_id)
            r_high = max(r1_id, r2_id)
            combination_rows.append((lang, r_low, r_high, cdesc, cadv))
    execute_values(cursor, """
        insert into content_test_combination (language, result_1_id, result_2_id, description, advice) values %s
    """, combination_rows)

    # insert jobs for tests
    test_job_rows = []
    for t in data:
        slug = t.get("slug")
        jobs = t.get("job", [])
        for jb in jobs:
            test_job_rows.append((jb, t_id_map[slug]))
    execute_values(cursor, "insert into job_content_test (job_slug, content_test_id) values %s", test_job_rows)


def insert_journeys(cursor, data, lang):
    logging.info(f"Inserting {len(data)} journeys for language {lang}.")
    if not data:
        return
    j_rows = [(j.get("slug", ""), lang, j.get("title", ""), j.get("description", "")) for j in data]
    # Directly insert into content_journey and retrieve id and slug
    query = """
        INSERT INTO content_journey (slug, language, title, description)
        VALUES %s
        RETURNING id, slug;
    """
    logging.info(f"Inserting {len(j_rows)} journey records directly into content_journey.")
    execute_values(cursor, query, j_rows, page_size=1000)
    j_id_map = {row[1]: row[0] for row in cursor.fetchall()}

    step_rows = []
    for j in data:
        jid = j_id_map.get(j.get("slug", ""))
        subtopics = j.get("subtopics", [])
        for s in subtopics:
            stitle = s.get("title", "")
            sdesc = s.get("description", "")
            step_rows.append((jid, lang, stitle, sdesc))

    cursor.execute(
        "CREATE TEMPORARY TABLE tmp_journey_step (journey_id int, language text, title text, description text) ON COMMIT DROP;")
    logging.info(f"Inserting {len(step_rows)} journey steps into temporary table.")
    execute_values(cursor, "INSERT INTO tmp_journey_step (journey_id, language, title, description) VALUES %s",
                   step_rows)
    cursor.execute("""
        INSERT INTO content_journey_step (journey_id, language, title, description)
        SELECT journey_id, language, title, description FROM tmp_journey_step
        RETURNING id, journey_id, title
    """)
    step_id_map = {(r[1], r[2]): r[0] for r in cursor.fetchall()}

    journey_step_content_rows = []
    logging.info(f"Inserting journey steps specific content")
    for j in data:
        jid = j_id_map.get(j.get("slug", ""))
        subtopics = j.get("subtopics", [])
        day = 1
        for s in subtopics:
            stitle = s.get("title", "")
            sid = step_id_map.get((jid, stitle))
            for c in s.get("content", []):
                ctype = c.get("type")
                cslug = c.get("slug")
                qid, aid, cid, exid, gid, tid = None, None, None, None, None, None
                if ctype == "question":
                    cursor.execute("SELECT id FROM content_question WHERE slug=%s AND language=%s", (cslug, lang))
                    qres = cursor.fetchone()
                    qid = qres[0]
                elif ctype == "article":
                    cursor.execute("SELECT id FROM content_article WHERE slug=%s AND language=%s", (cslug, lang))
                    ares = cursor.fetchone()
                    aid = ares[0]
                elif ctype == "checkup":
                    cursor.execute("SELECT id FROM content_checkup WHERE slug=%s AND language=%s", (cslug, lang))
                    cres = cursor.fetchone()
                    cid = cres[0]
                elif ctype == "exercise":
                    cursor.execute("SELECT id FROM content_exercise WHERE slug=%s AND language=%s", (cslug, lang))
                    eres = cursor.fetchone()
                    exid = eres[0]
                elif ctype == "game":
                    cursor.execute("SELECT id FROM content_game WHERE slug=%s AND language=%s", (cslug, lang))
                    gres = cursor.fetchone()
                    gid = gres[0]
                elif ctype == "test":
                    cursor.execute("SELECT id FROM content_test WHERE slug=%s AND language=%s", (cslug, lang))
                    tres = cursor.fetchone()
                    tid = tres[0]
                else:
                    raise Exception(f"Unknown content type: {ctype}")

                journey_step_content_rows.append((jid, sid, lang, day, qid, aid, cid, exid, gid, tid))
                day += 1

    logging.info(f"Inserting {len(journey_step_content_rows)} journey step contents into content_journey_step_content.")
    execute_values(cursor, """
        INSERT INTO content_journey_step_content (
            journey_id, journey_step_id, language, day,
            question_id, article_id, checkup_id, exercise_id, game_id, test_id
        )
        VALUES %s
    """, journey_step_content_rows)

    # Insert jobs for journeys
    journey_job_rows = []
    for j in data:
        slug = j.get("slug")
        jobs = j.get("job", [])
        for jb in jobs:
            journey_job_rows.append((jb, j_id_map[slug]))
    logging.info(f"Inserting {len(journey_job_rows)} job associations for journeys.")
    execute_values(cursor, "INSERT INTO job_content_journey (job_slug, content_journey_id) VALUES %s", journey_job_rows)


def graceful_exit(conn, cursor):
    logging.info("Shutting down gracefully...")
    if cursor:
        cursor.close()
    if conn:
        conn.close()
    sys.exit(0)


def delete_content_for_language(cursor, lang):
    logging.info(f"Deleting existing content for language: {lang}")
    delete_queries = [
        "DELETE FROM content_journey_step_content WHERE language = %s",
        "DELETE FROM content_journey_step WHERE language = %s",
        "DELETE FROM content_journey WHERE language = %s",
        "DELETE FROM content_test_combination WHERE language = %s",
        "DELETE FROM content_test_question_option WHERE language = %s",
        "DELETE FROM content_test_question WHERE language = %s",
        "DELETE FROM content_test_result WHERE language = %s",
        "DELETE FROM content_test WHERE language = %s",
        "DELETE FROM content_game_question_option WHERE language = %s",
        "DELETE FROM content_game_question WHERE language = %s",
        "DELETE FROM content_game WHERE language = %s",
        "DELETE FROM content_exercise_step WHERE language = %s",
        "DELETE FROM content_exercise WHERE language = %s",
        "DELETE FROM content_checkup_question WHERE language = %s",
        "DELETE FROM content_checkup WHERE language = %s",
        "DELETE FROM content_article_answer WHERE language = %s",
        "DELETE FROM content_article_details WHERE language = %s",
        "DELETE FROM content_article WHERE language = %s",
        "DELETE FROM content_question WHERE language = %s"
    ]
    for query in delete_queries:
        cursor.execute(query, (lang,))
    logging.info(f"Deleted existing content for language: {lang}")


def main():
    signal.signal(signal.SIGINT, lambda s, f: sys.exit(0))
    confirm = input("This will delete all existing content. Are you sure? (y/N) ")
    if confirm.lower() != 'y':
        logging.info("Aborted by user.")
        return
    logging.info("Starting data insertion process.")
    conn = None
    cursor = None
    try:
        logging.info("Establishing database connection.")
        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT)
        cursor = conn.cursor()
        insert_jobs(cursor)
        for lang in LANGUAGES:
            base_dir = os.path.join(".", lang)
            if not os.path.exists(base_dir):
                logging.info(f"no folder {base_dir}")
            logging.info(f"Processing language {lang}")
            try:
                delete_content_for_language(cursor, lang)

                a_data = load_json_files(os.path.join(base_dir, "article"))
                insert_articles(cursor, a_data, lang)

                t_data = load_json_files(os.path.join(base_dir, "test"))
                insert_tests(cursor, t_data, lang)

                q_data = load_json_files(os.path.join(base_dir, "question"))
                insert_questions(cursor, q_data, lang)



                e_data = load_json_files(os.path.join(base_dir, "exercise"))
                insert_exercises(cursor, e_data, lang)

                ch_data = load_json_files(os.path.join(base_dir, "checkup"))
                insert_checkups(cursor, ch_data, lang)

                g_data = load_json_files(os.path.join(base_dir, "game"))
                insert_games(cursor, g_data, lang)

                j_data = load_json_files(os.path.join(base_dir, "journey"))
                insert_journeys(cursor, j_data, lang)

                conn.commit()
                logging.info(f"Successfully inserted content for language: {lang}")
            except Exception as lang_ex:
                # Rollback the transaction for the current language
                conn.rollback()
                logging.error(f"Error inserting content for language {lang}: {lang_ex}")
                raise lang_ex
        logging.info("Data inserted successfully.")
    except KeyboardInterrupt:
        logging.warning("KeyboardInterrupt caught. Rolling back changes and exiting.")
        if conn:
            conn.rollback()
        graceful_exit(conn, cursor)
    except Exception as ex:
        logging.error(f"Error occurred: {ex}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        logging.info("Database connection closed.")


if __name__ == "__main__":
    main()
