import json
import logging
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock
from typing import Dict, List

import openai

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Constants
MAX_RETRIES = 3
RETRY_DELAY = 1
PARAMS = {
    "model": "o1-mini",
    "max_tokens": 12000,
}
MAX_WORKERS = 1

# All available jobs
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

# Load environment variables
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Initialize OpenAI client
openai.api_key = OPENAI_API_KEY


def read_content_json() -> List[Dict]:
    try:
        with open('./content_with_interpretation.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def write_content_json(data: List[Dict]):
    with open('./content_with_interpretation.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def call_gpt(content: str) -> List[Dict]:
    messages = [
        {"role": "user", "content": """{
                                         "job": ["getting_to_know_partner", "exploring_feelings"],
                                         "title": "Main Personality Type",
                                         "research": "This quiz is based on personality psychology, including the Big Five traits framework, to help you understand and celebrate each other's unique personalities.",
                                         "description": "Explore your partner's personality traits, quirks, and habits with this fun and insightful quiz! Discover what makes each other unique and strengthen your bond through deeper understanding.",
                                         "questions": [
                                           {
                                             "question": "When making plans for the weekend, how do you prefer to decide what to do?",
                                             "options": [
                                               "I love trying new and adventurous activities.",
                                               "I like having a detailed schedule to follow.",
                                               "I enjoy social gatherings and being around friends.",
                                               "I prioritize harmony and choose activities everyone can enjoy.",
                                               "I often worry about whether the plans are perfect."
                                             ]
                                           },
                                           {
                                             "question": "How do you usually handle your tasks and responsibilities?",
                                             "options": [
                                               "I'm always open to new methods and ideas.",
                                               "I stay organized and stick to my plans.",
                                               "I thrive in busy and interactive environments.",
                                               "I cooperate well with others to get things done.",
                                               "I get stressed if things don't go as planned."
                                             ]
                                           },
                                           {
                                             "question": "In a conversation, what is your typical behavior?",
                                             "options": [
                                               "I enjoy discussing a wide range of topics and ideas.",
                                               "I focus on practical and specific subjects.",
                                               "I love engaging and lively discussions.",
                                               "I listen carefully and try to maintain a positive tone.",
                                               "I might feel anxious if the conversation becomes intense."
                                             ]
                                           },
                                           {
                                             "question": "When facing a conflict, how do you respond?",
                                             "options": [
                                               "I'm open to creative solutions to resolve it.",
                                               "I prefer to address it directly and systematically.",
                                               "I seek support and advice from friends.",
                                               "I aim to keep the peace and avoid arguments.",
                                               "I often feel overwhelmed and unsure how to proceed."
                                             ]
                                           },
                                           {
                                             "question": "How do you express your feelings in a relationship?",
                                             "options": [
                                               "I enjoy sharing new and unique ways to show affection.",
                                               "I express my feelings through reliable and consistent actions.",
                                               "I'm expressive and often share my emotions openly.",
                                               "I focus on being supportive and considerate.",
                                               "I might hold back my feelings due to fear of judgment."
                                             ]
                                           },
                                           {
                                             "question": "What motivates you most in your personal goals?",
                                             "options": [
                                               "Exploring new possibilities and experiences.",
                                               "Achieving my goals through careful planning and effort.",
                                               "Connecting with others and gaining recognition.",
                                               "Ensuring that my efforts benefit those around me.",
                                               "Avoiding failure and managing my fears."
                                             ]
                                           },
                                           {
                                             "question": "How do you prefer to spend your free time?",
                                             "options": [
                                               "Trying out new hobbies or learning something different.",
                                               "Organizing or completing personal projects.",
                                               "Socializing and being around friends and family.",
                                               "Engaging in activities that promote harmony and relaxation.",
                                               "Spending time alone to reflect and recharge."
                                             ]
                                           },
                                           {
                                             "question": "When your partner shares their ideas, how do you react?",
                                             "options": [
                                               "I love brainstorming and expanding on their ideas.",
                                               "I appreciate structured and well-thought-out plans.",
                                               "I get excited and add my own energetic input.",
                                               "I listen attentively and support their perspective.",
                                               "I might feel hesitant if the ideas are too unconventional."
                                             ]
                                           },
                                           {
                                             "question": "How do you approach making important decisions together?",
                                             "options": [
                                               "We explore various creative options before deciding.",
                                               "We create a step-by-step plan to reach a decision.",
                                               "We discuss and decide based on what feels right at the moment.",
                                               "We focus on what's best for both of us and compromise.",
                                               "I often worry about making the wrong choice."
                                             ]
                                           },
                                           {
                                             "question": "What role do you usually take in your relationship?",
                                             "options": [
                                               "I bring new ideas and perspectives to the relationship.",
                                               "I ensure things run smoothly and stay organized.",
                                               "I keep the relationship lively and full of energy.",
                                               "I maintain peace and support my partner's needs.",
                                               "I often contemplate how to improve and manage my feelings."
                                             ]
                                           }
                                         ],
                                         "evaluation_method": {
                                           "explanation": "Each answer corresponds to one of the Big Five personality traits: Openness (1), Conscientiousness (2), Extraversion (3), Agreeableness (4), and Neuroticism (5)",
                                           "example": "For example, if you selected option 1 most frequently, you likely have high Openness, meaning you enjoy new experiences and creativity in your relationship."
                                         }
                                     }"""},
        {"role": "assistant", "content": """{
                                              "outcome_interpretation": {
                                                "1": {
                                                  "label": "Openness to Experience",
                                                  "description": "You are open-minded and love exploring new ideas and activities. You enjoy trying different hobbies, traveling to new places, and embracing change within your relationship. Your creativity and adaptability make your relationship dynamic and full of fresh experiences. You likely bring a sense of adventure and curiosity, encouraging both you and your partner to step out of your comfort zones and grow together.",
                                                  "advice": "Plan regular activities that allow you to explore new interests together, such as taking a class, traveling to a new destination, or starting a new hobby. Encourage each other's creative pursuits by providing support and sharing ideas. Make space for spontaneity in your routine to keep the relationship lively and exciting. Additionally, engage in deep conversations about dreams and aspirations to further connect on an intellectual and emotional level."
                                                },
                                                "2": {
                                                  "label": "Conscientiousness",
                                                  "description": "You are organized, reliable, and value structure in your relationship. You prefer having clear plans and follow through with commitments, which helps maintain stability and ensures that both partners' needs are consistently met. Your attention to detail and sense of responsibility contribute to a secure and predictable partnership.",
                                                  "advice": "Maintain your structured approach by setting shared goals and creating schedules that work for both of you. While staying organized, allow flexibility for unexpected changes or spontaneous activities to keep the relationship balanced. Recognize and appreciate each other's reliability to strengthen your bond. Implement regular check-ins to discuss progress on mutual goals and adjust plans as needed. Additionally, create systems for managing household tasks or joint projects to ensure both partners feel involved and supported."
                                                },
                                                "3": {
                                                  "label": "Extraversion",
                                                  "description": "You are energetic and thrive on social interactions. Your enthusiasm and sociability bring joy and liveliness to your relationship, making it vibrant and engaging for both partners. You likely enjoy being around people, organizing social events, and bringing a dynamic energy to your interactions.",
                                                  "advice": "Balance your social activities with quality time alone to ensure both partners feel connected and appreciated. Plan social events that you both enjoy and take turns leading activities to keep things exciting. Make sure to communicate your need for both social engagement and personal downtime. Additionally, encourage your partner to participate in activities that energize them, and be mindful of their social needs. Schedule regular date nights or intimate moments to maintain a strong personal connection amidst your active social life."
                                                },
                                                "4": {
                                                  "label": "Agreeableness",
                                                  "description": "You are cooperative, compassionate, and value harmony in your relationship. Your supportive nature fosters a loving and understanding environment, making your partnership strong and nurturing. You prioritize your partner's well-being and strive to create a peaceful and accommodating atmosphere.",
                                                  "advice": "Continue nurturing your supportive nature by regularly expressing appreciation and kindness towards your partner. Ensure that your own needs are also communicated and met by setting healthy boundaries. Engage in activities that promote mutual support and understanding to maintain a harmonious relationship. Additionally, practice active listening and empathy to deepen your emotional connection. Encourage open dialogues about feelings and concerns to prevent misunderstandings and ensure both partners feel valued and respected."
                                                },
                                                "5": {
                                                  "label": "Neuroticism",
                                                  "description": "You are highly in tune with your emotions and may experience them intensely. This emotional awareness can lead to deep connections but also a strong desire for stability and reassurance in your relationship. You may be more sensitive to stress and seek a secure and supportive partnership.",
                                                  "advice": "Develop healthy coping strategies together, such as practicing mindfulness or engaging in stress-reduction activities like yoga or meditation. Communicate openly about your feelings to build trust and emotional intimacy. Create a supportive environment where both partners feel safe to express their emotions and seek reassurance when needed. Additionally, establish routines that provide stability, such as regular check-ins or shared rituals, to help manage anxiety and foster a sense of security. Encourage each other to seek professional support if needed to navigate emotional challenges effectively."
                                                }
                                              },
                                              "combination": {
                                                "1_1": {
                                                  "description": "Both of you are high in Openness to Experience, fostering a relationship rich in creativity and exploration. You enjoy shared adventures and innovative projects, making your partnership dynamic and exciting. This mutual love for novelty keeps the relationship fresh and continuously evolving.",
                                                  "advice": "Plan regular creative activities together, such as traveling, taking up new hobbies, or working on artistic projects. Encourage each other's ideas and maintain a sense of adventure. To prevent burnout, establish some routine activities that provide stability alongside your creative pursuits. Additionally, set aside time for reflective conversations about your experiences and aspirations to deepen your mutual understanding and support each other's growth."
                                                },
                                                "1_2": {
                                                  "description": "One of you is high in Openness while the other is high in Conscientiousness. This balance ensures that innovative ideas are paired with practical execution, creating a well-rounded and effective partnership. The creative partner brings fresh perspectives, while the organized partner ensures that plans are implemented efficiently.",
                                                  "advice": "Collaborate on projects by combining creativity with structured planning. The Openness partner can generate new ideas, while the Conscientiousness partner can organize and implement them. Respect each other's strengths and find a middle ground where creativity and organization complement each other. Schedule regular brainstorming sessions followed by planning meetings to ensure that innovative ideas are systematically executed. Additionally, acknowledge and celebrate each other's contributions to reinforce mutual respect and appreciation."
                                                },
                                                "1_3": {
                                                  "description": "One of you is high in Openness and the other is high in Extraversion. This creates a dynamic and engaging relationship filled with social activities and new experiences, keeping the relationship lively and fun. Your combined enthusiasm makes it easy to connect with others and explore diverse interests together.",
                                                  "advice": "Embrace each other's energy by participating in social events and creative pursuits together. Balance your active social life with moments of quiet connection to ensure both partners feel fulfilled. Encourage each other to explore new activities that cater to both creativity and sociability. Additionally, set aside time for both group activities and intimate one-on-one moments to maintain a healthy balance between social engagement and personal connection."
                                                },
                                                "1_4": {
                                                  "description": "One of you is high in Openness and the other is high in Agreeableness. This combination fosters a harmonious and supportive relationship where both partners are open to new ideas and prioritize mutual support. You collaborate effectively, blending creativity with compassion to create a balanced and nurturing partnership.",
                                                  "advice": "Encourage open communication and collaborative exploration of new interests. Support each other's creative and cooperative efforts to strengthen your bond. When disagreements arise, focus on finding common ground and mutually beneficial solutions to maintain harmony. Additionally, engage in joint projects that combine creativity and compassion, such as volunteering for a cause you both care about or creating something meaningful together. This will reinforce your shared values and deepen your emotional connection."
                                                },
                                                "1_5": {
                                                  "description": "One of you is high in Openness and the other is high in Neuroticism. This pairing combines creativity with emotional depth, allowing for meaningful and expressive interactions. Your relationship benefits from both innovative thinking and a strong emotional bond, creating a rich and supportive partnership.",
                                                  "advice": "Create a supportive environment where both partners feel safe to express their emotions and ideas. Balance adventurous activities with moments of emotional reassurance. Establish routines that provide stability for the Neurotic partner while allowing for creative exploration. Additionally, practice active listening and empathy to understand each other's perspectives. Engage in activities that promote both creativity and emotional well-being, such as collaborative art projects or joint mindfulness practices, to strengthen your connection."
                                                },
                                                "2_2": {
                                                  "description": "Both of you are high in Conscientiousness, leading to a well-organized and dependable relationship. You effectively manage responsibilities and maintain stability, ensuring that both partners' needs are consistently met. Your mutual reliability fosters a secure and predictable partnership.",
                                                  "advice": "Continue your structured approach by setting shared goals and maintaining organized schedules. Introduce opportunities for spontaneity to balance your organized nature. Appreciate each other's reliability and work together to create a stable yet flexible partnership. Additionally, establish systems for managing household tasks or joint projects to ensure both partners feel involved and supported. Regularly review and adjust your plans to accommodate any changes, ensuring that both partners remain aligned and satisfied with the relationship's direction."
                                                },
                                                "2_3": {
                                                  "description": "One of you is high in Conscientiousness and the other is high in Extraversion. This blend of organization and sociability creates a balanced and active relationship, efficiently managing social activities while enjoying lively interactions. You complement each other by combining structure with energetic participation.",
                                                  "advice": "Plan social activities that align with your organized schedules, ensuring that both partners' needs are met. Support each other's endeavors by combining structure with energetic participation. Allow flexibility in plans to accommodate spontaneous social opportunities without feeling constrained. Additionally, designate specific times for social events and personal downtime to maintain a healthy balance. Encourage open communication about your social preferences and adjust plans accordingly to ensure both partners feel satisfied and engaged."
                                                },
                                                "2_4": {
                                                  "description": "One of you is high in Conscientiousness and the other is high in Agreeableness. This pairing promotes a stable and harmonious relationship where both partners are reliable and compassionate, fostering mutual support and understanding. Your combined traits create a balanced and nurturing partnership.",
                                                  "advice": "Work together to create a supportive and structured environment. Appreciate each other's dedication and kindness to build a lasting partnership. Ensure that both partners take time to express their own needs and maintain personal well-being to prevent burnout. Additionally, engage in activities that reinforce your mutual support, such as planning and organizing events together or participating in community service. Regularly discuss your goals and values to ensure alignment and address any emerging needs or concerns promptly."
                                                },
                                                "2_5": {
                                                  "description": "One of you is high in Conscientiousness and the other is high in Neuroticism. This combination requires balancing structure with emotional sensitivity to maintain harmony and support each other effectively. Your organized approach provides stability, while emotional awareness fosters a deep emotional connection.",
                                                  "advice": "Use your organizational skills to create a stable environment that can help alleviate stress. Encourage open communication to address any emotional concerns. Provide reassurance and flexibility to support the Neurotic partner's emotional needs while maintaining structure. Additionally, establish routines that offer predictability and security, such as regular check-ins or shared schedules. Practice empathy and active listening to understand and validate each other's feelings, fostering a supportive and resilient partnership."
                                                },
                                                "3_3": {
                                                  "description": "Both of you are high in Extraversion, resulting in a lively and socially active relationship. Your mutual enthusiasm and energy make your partnership vibrant and full of joy. You enjoy engaging with others and thrive in dynamic environments, creating a fun and engaging connection.",
                                                  "advice": "Ensure you also carve out quiet time for deeper connection and intimacy. Balance your social engagements with private moments to maintain intimacy. Respect each other's need for occasional solitude to recharge and prevent burnout from constant social activity. Additionally, plan activities that cater to both your social and personal needs, such as attending events together and spending quality time at home. Communicate openly about your social schedules to ensure both partners feel included and valued."
                                                },
                                                "3_4": {
                                                  "description": "One of you is high in Extraversion and the other is high in Agreeableness. This combination fosters a warm and engaging relationship where both partners are sociable and supportive, creating a loving and active partnership. Your combined traits enhance communication and mutual support.",
                                                  "advice": "Participate in social activities together and support each other's desire to connect with others. Maintain a balance between your social life and personal time to ensure both partners feel fulfilled. Encourage the Agreeable partner to express their own needs and desires openly to prevent suppression. Additionally, engage in collaborative projects or group activities that strengthen your bond and allow both partners to shine. Foster an environment of open communication where both partners feel comfortable sharing their thoughts and feelings."
                                                },
                                                "3_5": {
                                                  "description": "One of you is high in Extraversion and the other is high in Neuroticism. This pairing blends social energy with emotional depth, requiring understanding and support to navigate differences effectively. Your relationship benefits from lively interactions and deep emotional connections.",
                                                  "advice": "Create a supportive environment where both partners feel comfortable expressing their emotions. Balance social activities with opportunities for emotional connection and reassurance. Ensure that the Neurotic partner feels secure and supported during social engagements to prevent feeling overwhelmed. Additionally, establish boundaries that respect each partner's social and emotional needs. Practice active listening and provide reassurance to build trust and emotional intimacy. Incorporate activities that cater to both your sociable nature and the need for emotional support, such as attending social events together and spending quiet time discussing your feelings."
                                                },
                                                "4_4": {
                                                  "description": "Both of you are high in Agreeableness, leading to a compassionate and harmonious relationship. Your mutual support and understanding create a strong, loving partnership. You prioritize each other's well-being and work together to maintain a peaceful and cooperative environment.",
                                                  "advice": "Continue to nurture your supportive nature by regularly expressing appreciation and kindness. Ensure that both partners' needs are communicated openly to maintain balance. When conflicts arise, approach them with openness and a willingness to find mutually beneficial solutions to preserve harmony. Additionally, engage in activities that reinforce your mutual support, such as volunteering together or participating in team-based hobbies. Foster an environment where both partners feel safe to express their true feelings and address any underlying issues constructively."
                                                },
                                                "4_5": {
                                                  "description": "One of you is high in Agreeableness and the other is high in Neuroticism. This combination requires balancing compassion with emotional sensitivity to maintain harmony and support each other effectively. Your relationship benefits from mutual understanding and a strong emotional bond.",
                                                  "advice": "Use your compassionate nature to support your partner's emotional needs. Encourage open dialogue to address any anxieties and build emotional resilience together. Ensure that both partners feel heard and supported in their emotional expressions to maintain a balanced and understanding relationship. Additionally, practice active listening and empathy to deepen your emotional connection. Engage in stress-reduction activities together, such as mindfulness or exercise, to manage emotional challenges and foster a supportive environment."
                                                },
                                                "5_5": {
                                                  "description": "Both of you are high in Neuroticism, which can lead to heightened emotional experiences and a deep emotional connection. Managing emotions effectively is key to maintaining harmony in your relationship. Your shared emotional depth can create a strong bond, but also requires careful handling of stress and anxiety.",
                                                  "advice": "Develop healthy coping strategies together, such as practicing mindfulness or engaging in stress-reduction activities like yoga or meditation. Communicate openly about your feelings to build trust and emotional intimacy. Focus on building emotional resilience and supporting each other's well-being to navigate emotional challenges together. Additionally, establish routines that provide stability and predictability, helping to manage anxiety and reduce emotional volatility. Consider seeking professional support, such as couples therapy, to develop effective strategies for managing stress and enhancing your emotional connection."
                                                }
                                              }
                                            }"""},

        {"role": "user", "content": """{
   "job": ["understanding_mutual_compatibility", "enhancing_love_and_affection", "exploring_feelings"],
                                                   "title": "Discover Your Love Language Connection",
                                                   "research": "This quiz is based on Gary Chapman's Five Love Languages, which explores the different ways people express and receive love. Understanding your love languages can enhance communication and strengthen your relationship.",
                                                   "description": "Ever wondered why you and your partner show love in different ways? Take this fun quiz to uncover your primary love languages and see how well you connect with each other's emotional needs!",
                                                   "questions": [
                                                     {
                                                       "question": "When your partner surprises you with a gift, how do you feel most loved?",
                                                       "options": [
                                                         "Thrilled and appreciated because you thought of me.",
                                                         "Happy to spend quality time together unwrapping it.",
                                                         "Grateful for their effort and the time spent choosing it.",
                                                         "Pleased to hear their words of affirmation about the gift.",
                                                         "Content knowing they understand my needs."
                                                       ]
                                                     },
                                                     {
                                                       "question": "How do you prefer to spend quality time with your partner?",
                                                       "options": [
                                                         "Engaging in deep conversations and sharing thoughts.",
                                                         "Participating in activities or hobbies together.",
                                                         "Enjoying physical closeness like cuddling or holding hands.",
                                                         "Receiving compliments and verbal affirmations.",
                                                         "Having uninterrupted time to connect without distractions."
                                                       ]
                                                     },
                                                     {
                                                       "question": "What makes you feel most appreciated by your partner?",
                                                       "options": [
                                                         "Hearing them say 'I love you' regularly.",
                                                         "Receiving thoughtful gifts that show they know me well.",
                                                         "Spending meaningful time together doing something we both enjoy.",
                                                         "Acts of service like helping with chores or tasks.",
                                                         "Physical touch such as hugs, kisses, or a gentle touch."
                                                       ]
                                                     },
                                                     {
                                                       "question": "When you're having a tough day, what do you prefer your partner to do?",
                                                       "options": [
                                                         "Listen to you talk about your feelings without judgment.",
                                                         "Surprise you with a small gift to lift your spirits.",
                                                         "Spend time with you, engaging in a favorite activity together.",
                                                         "Help you with tasks or responsibilities to reduce your stress.",
                                                         "Offer comforting hugs or hold your hand to show support."
                                                       ]
                                                     },
                                                     {
                                                       "question": "How do you express your love most naturally?",
                                                       "options": [
                                                         "Sharing heartfelt words and compliments.",
                                                         "Giving thoughtful gifts that show you care.",
                                                         "Spending quality time and creating memories together.",
                                                         "Performing acts of service to make their life easier.",
                                                         "Showing physical affection through touch."
                                                       ]
                                                     },
                                                     {
                                                       "question": "What type of gesture from your partner makes you feel closest to them?",
                                                       "options": [
                                                         "A sincere and heartfelt compliment.",
                                                         "A meaningful gift that reflects your interests.",
                                                         "A dedicated evening spent just the two of you.",
                                                         "Helping out with something important to you.",
                                                         "A warm embrace or a gentle touch."
                                                       ]
                                                     },
                                                     {
                                                       "question": "How do you like to celebrate special occasions with your partner?",
                                                       "options": [
                                                         "Exchanging heartfelt messages and expressing love verbally.",
                                                         "Receiving and giving thoughtful gifts that have significance.",
                                                         "Spending uninterrupted quality time together doing something fun.",
                                                         "Helping to plan and organize the celebration to make it perfect.",
                                                         "Sharing affectionate gestures like dancing or cuddling."
                                                       ]
                                                     },
                                                     {
                                                       "question": "What makes you feel most connected to your partner?",
                                                       "options": [
                                                         "Having deep and meaningful conversations.",
                                                         "Exchanging gifts that show you understand each other.",
                                                         "Engaging in activities or hobbies together.",
                                                         "Assisting each other with daily tasks and responsibilities.",
                                                         "Sharing physical intimacy and closeness."
                                                       ]
                                                     },
                                                     {
                                                       "question": "When thinking about a perfect date, what stands out the most to you?",
                                                       "options": [
                                                         "A heartfelt conversation over a cozy dinner.",
                                                         "Receiving a thoughtful gift during the date.",
                                                         "Doing an activity you both enjoy, like hiking or visiting a museum.",
                                                         "Your partner taking care of tasks or planning everything.",
                                                         "Being close and affectionate throughout the evening."
                                                       ]
                                                     },
                                                     {
                                                       "question": "How do you prefer to resolve conflicts with your partner?",
                                                       "options": [
                                                         "Talking it out and expressing your feelings openly.",
                                                         "Apologizing with a meaningful gift to make amends.",
                                                         "Spending time together to reconnect and move forward.",
                                                         "Taking actions that show you care and want to fix things.",
                                                         "Using physical affection to comfort and reconcile."
                                                       ]
                                                     }
                                                   ],
                                                   "evaluation_method": {
                                                     "explanation": "Each answer corresponds to one of Gary Chapman's Five Love Languages: Words of Affirmation (1), Gifts (2), Quality Time (3), Acts of Service (4), and Physical Touch (5).",
                                                     "example": "For example, if most of your answers are '1', your primary love language is Words of Affirmation. If your partner's answers are mostly '3', their primary love language is Quality Time."
                                                   }
                                               }"""},

        {"role": "assistant", "content": """{
                                                  "outcome_interpretation": {
                                                      "1": {
                                                        "label": "Words of Affirmation",
                                                        "description": "You value verbal expressions of love and appreciation. Hearing kind words and receiving compliments make you feel cherished.",
                                                        "advice": "Make an effort to regularly express your feelings through words. Encourage your partner to do the same to strengthen your emotional bond."
                                                      },
                                                      "2": {
                                                        "label": "Gifts",
                                                        "description": "You appreciate thoughtful gifts that show your partner is thinking about you. These tokens of love make you feel special.",
                                                        "advice": "Surprise your partner with meaningful gifts that reflect their interests. Remember that it's the thought behind the gift that counts."
                                                      },
                                                      "3": {
                                                        "label": "Quality Time",
                                                        "description": "Spending uninterrupted time together is essential for you. Sharing activities and creating memories strengthen your connection.",
                                                        "advice": "Prioritize regular quality time with your partner. Engage in activities you both enjoy to deepen your relationship."
                                                      },
                                                      "4": {
                                                        "label": "Acts of Service",
                                                        "description": "You feel loved when your partner helps you with tasks and goes out of their way to make your life easier.",
                                                        "advice": "Show your love by offering help and support in your partner's daily tasks. Small gestures can have a big impact."
                                                      },
                                                      "5": {
                                                        "label": "Physical Touch",
                                                        "description": "Physical affection, such as hugs and kisses, is how you feel most connected to your partner.",
                                                        "advice": "Incorporate more physical touch into your daily interactions. Simple gestures like holding hands or a gentle touch can enhance your intimacy."
                                                      }
                                                    },
                                                    "combination": {
                                                      "1_1": {
                                                        "description": "Both of you primarily value Words of Affirmation, fostering a relationship rich in verbal appreciation and emotional expression. You'll thrive on open communication and frequent expressions of love. However, you might struggle if actions are needed beyond words.",
                                                        "advice": "Continue to express your feelings openly and regularly. Compliment each other and share affirming words to maintain a strong emotional connection. Additionally, incorporate some actions to complement your verbal expressions."
                                                      },
                                                      "1_2": {
                                                        "description": "One of you values Words of Affirmation while the other values Gifts. This combination blends verbal appreciation with thoughtful gestures, enhancing mutual understanding. You will thrive on both spoken and tangible expressions of love, but might struggle if one prefers actions over words or vice versa.",
                                                        "advice": "Balance your expressions by combining kind words with meaningful gifts. Recognize and appreciate each other's preferred ways of receiving love. For example, accompany a heartfelt compliment with a small, thoughtful gift."
                                                      },
                                                      "1_3": {
                                                        "description": "One of you values Words of Affirmation and the other values Quality Time. This pairing encourages both verbal communication and shared experiences. You will thrive on meaningful conversations and enjoying each other's presence, but may struggle if one desires more verbal affirmation while the other seeks more focused time together.",
                                                        "advice": "Engage in meaningful conversations during your quality time together. Use words to express appreciation while enjoying activities you both love. Ensure that both verbal and quality time needs are being met."
                                                      },
                                                      "1_4": {
                                                        "description": "One of you values Words of Affirmation and the other values Acts of Service. This combination creates a supportive environment where both verbal and practical expressions of love are appreciated. You will thrive on both spoken encouragement and helpful actions, but might struggle if one feels that words are not backed by actions or vice versa.",
                                                        "advice": "Express your feelings through words while also supporting each other with helpful actions. Acknowledge and appreciate each other's efforts in both areas to ensure both love languages are being met."
                                                      },
                                                      "1_5": {
                                                        "description": "One of you values Words of Affirmation and the other values Physical Touch. This pairing fosters a connection through both verbal and physical expressions of love. You will thrive on both spoken affirmations and affectionate gestures, but may struggle if one prefers more verbal communication while the other seeks more physical intimacy.",
                                                        "advice": "Combine heartfelt words with affectionate gestures. Use physical touch to reinforce your verbal expressions of love and appreciation. Ensure that both verbal and physical needs are being fulfilled."
                                                      },
                                                      "2_2": {
                                                        "description": "Both of you primarily value Gifts, leading to a relationship filled with thoughtful gestures and meaningful presents. You'll thrive on the exchange of gifts that show understanding and appreciation. However, you might struggle if gifts become the sole focus of your expressions of love, potentially overlooking other forms of connection.",
                                                        "advice": "Continue to surprise each other with thoughtful gifts that reflect your understanding of one another. Celebrate special occasions with meaningful tokens of love while also incorporating other love languages to maintain a well-rounded relationship."
                                                      },
                                                      "2_3": {
                                                        "description": "One of you values Gifts while the other values Quality Time. This combination blends thoughtful gestures with shared experiences, enhancing mutual appreciation. You will thrive on both tangible and experiential expressions of love, but may struggle if one prefers gifts over spending time together or vice versa.",
                                                        "advice": "Combine gift-giving with quality time activities. Present thoughtful gifts during shared experiences to create lasting memories. Ensure that both the giving of gifts and spending time together are balanced to meet each other's needs."
                                                      },
                                                      "2_4": {
                                                        "description": "One of you values Gifts and the other values Acts of Service. This pairing creates a balanced relationship where both thoughtful gestures and helpful actions are valued. You will thrive on both giving gifts and performing services for each other, but might struggle if one feels that gifts are more meaningful than actions or vice versa.",
                                                        "advice": "Appreciate each other's efforts by combining gift-giving with acts of service. Recognize and celebrate the different ways you show love, ensuring that both love languages are acknowledged and valued."
                                                      },
                                                      "2_5": {
                                                        "description": "One of you values Gifts and the other values Physical Touch. This combination enhances the relationship with both thoughtful gestures and affectionate interactions. You will thrive on both giving gifts and sharing physical closeness, but may struggle if one prefers tangible gifts while the other seeks more physical affection.",
                                                        "advice": "Balance gift-giving with physical affection. Present meaningful gifts while also engaging in regular physical touch to strengthen your bond. Ensure that both love languages are being fulfilled to maintain harmony."
                                                      },
                                                      "3_3": {
                                                        "description": "Both of you primarily value Quality Time, resulting in a deeply connected and engaged relationship through shared experiences and mutual activities. You'll thrive on spending uninterrupted time together and creating memories. However, you might struggle if you neglect other forms of expressing love, such as verbal affirmations or physical touch.",
                                                        "advice": "Continue to prioritize quality time together. Plan regular activities that you both enjoy to maintain a strong and connected relationship. Additionally, incorporate other love languages to ensure a well-rounded emotional connection."
                                                      },
                                                      "3_4": {
                                                        "description": "One of you values Quality Time while the other values Acts of Service. This pairing fosters a relationship where shared experiences are supported by helpful actions. You will thrive on both spending time together and assisting each other, but may struggle if one prioritizes time over actions or vice versa.",
                                                        "advice": "Combine your quality time with acts of service. Support each other during shared activities by assisting with tasks, enhancing your mutual experiences. Ensure that both love languages are balanced to meet each other's needs."
                                                      },
                                                      "3_5": {
                                                        "description": "One of you values Quality Time and the other values Physical Touch. This combination strengthens the relationship through both shared experiences and physical closeness. You will thrive on enjoying activities together and expressing love through touch, but may struggle if one desires more physical affection while the other seeks more quality time.",
                                                        "advice": "Engage in activities you both enjoy while incorporating physical affection. Use your time together to connect both emotionally and physically, ensuring that both love languages are being satisfied."
                                                      },
                                                      "4_4": {
                                                        "description": "Both of you primarily value Acts of Service, leading to a supportive and cooperative relationship where both partners actively help each other. You'll thrive on mutual assistance and practical support, but might struggle if acts of service become expected obligations rather than expressions of love.",
                                                        "advice": "Continue to support each other with helpful actions. Recognize and appreciate the efforts you both make to assist and care for one another. Ensure that acts of service remain genuine expressions of love."
                                                      },
                                                      "4_5": {
                                                        "description": "One of you values Acts of Service while the other values Physical Touch. This pairing creates a balanced relationship where practical support and physical affection coexist. You will thrive on both helping each other and sharing physical closeness, but may struggle if one prioritizes actions over physical expressions or vice versa.",
                                                        "advice": "Combine acts of service with physical touch to show your love. Support each other through helpful actions while also engaging in affectionate gestures to meet both love languages."
                                                      },
                                                      "5_5": {
                                                        "description": "Both of you primarily value Physical Touch, resulting in a relationship rich in affectionate interactions and physical closeness. You'll thrive on expressing love through touch and maintaining a strong physical connection. However, you might struggle if physical touch becomes the only way you express love, potentially neglecting other forms of emotional connection.",
                                                        "advice": "Continue to express your love through physical affection. Ensure that your physical connection remains strong by maintaining regular affectionate interactions. Additionally, incorporate other love languages to enhance your emotional bond."
                                                      }
                                                    }
                                                }
"""},
        {"role": "user", "content": f"""
        You are a professional relationship coach, psychotherapist in CBT practice.
            You are also a co-founder of mobile Nemlys couple app that helps couples to get to know each other, discuss hard topics, sex, fun, and insightful questions to get closer online.


        you need to generate a test for the following content: {content}
        Generate the result intepretation of the quizz

        2. Your results and the combination must have a scientific mindset and be based on science, title, options fo the quiz and explanations
        You need to include both good and bad results, for example, some people will be anxiously attached and it is fine, but write sportively and nicely about it, not harshly. in combination description talk both about the positive sides of hte results and the potential struggles, in advice section say how to enjoy the positives and cope with the struggles
        3. every tests MUST have 5 results  4. Return exactly 1 test in valid JSON STRING format, no prefix, no suffix, just a string
        7. outcome_interpretation are always individual and should be about 1 individual who is taking the tests.
        7. combination contain shared results between 2 takers, current and the partner, this sections is talking about 2 people
        you need to provide 5 results "1", "2", "3", "4", "5" and combination fo the all results:  "1_1", 1_2", "1_3", "1_4", "1_5", "2_2", "2_3", "2_4", "2_5", "3_3", "3_4", "3_5", "4_4", "4_5", "5_5"
        when you provide negative results, be extremely nice, kind and compassionate in wording, bring the bad news politely not harshly
        every results must have "description" and "advice", description and advice you write must be concrete, useful and long. MINIMUM 4 sentences every description and advice
        do not bullshit, sound fluffy, be up to the point, precise, nice and kind but specific and actionable
        """}
    ]

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logging.info(f"Attempting API call for job '{content}' (attempt {attempt}/{MAX_RETRIES})")
            response = openai.chat.completions.create(
                model=PARAMS["model"],
                messages=messages
            )
            print(response)
            content = response.choices[0].message.content.strip("json```")
            content = content.strip("```")

            # Parse the response as JSON
            try:
                question = json.loads(content)
                return question
            except json.JSONDecodeError as e:
                logging.error(f"Failed to parse JSON response for job '{content}': {e}")
                if attempt == MAX_RETRIES:
                    return {}

        except Exception as e:
            logging.error(f"Error during API call for job '{content}': {e}")
            if attempt == MAX_RETRIES:
                return []
            time.sleep(RETRY_DELAY)

    return []


file_lock = Lock()


def process_job(content) -> List[Dict]:
    questions = call_gpt(json.dumps(content))
    if questions:
        with file_lock:
            # Read current content
            current_content = read_content_json()
            # TODO forgot to verify the structure
            content.update(questions)

            # Add new questions
            current_content.append(content)

            # Write updated content
            write_content_json(current_content)

            logging.info(f"Successfully processed job '{content}' and updated content.json")
            return questions
    return []


def main():
    logging.info("Starting question generation process")

    # Initialize empty content.json if it doesn't exist
    if not os.path.exists('./content_with_interpretation.json'):
        write_content_json([])
    themes = []
    with open('./content.json', 'r', encoding='utf-8') as f:
        themes = json.load(f)
    # Process jobs in parallel
    rnd_themes = themes
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_job = {executor.submit(process_job, theme): theme['title'] for theme in rnd_themes}
        for future in as_completed(future_to_job):
            job = future_to_job[future]
            try:
                questions = future.result()
                logging.info(f"Completed processing job '{job}'")
            except Exception as exc:
                logging.error(f"Job '{job}' generated an exception: {exc}")

    logging.info("Question generation process completed")


if __name__ == "__main__":
    main()
