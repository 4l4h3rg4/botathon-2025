import random
from faker import Faker
from datetime import datetime, timedelta
import uuid

fake = Faker('es_ES')

SKILLS = ["Primeros Auxilios", "Logística", "Cocina", "Conducción", "Psicología", "Rescate", "Idiomas", "Informática"]
REGIONS = ["Metropolitana", "Valparaíso", "Biobío", "Araucanía", "Los Lagos"]
CAMPAIGNS = [("Campaña Invierno", 2024), ("Incendios Forestales", 2024), ("Navidad Solidaria", 2023), ("Vuelta a Clases", 2024)]
LOG_SOURCES = ["SYSTEM", "USER", "BOT", "API"]
LOG_LEVELS = ["INFO", "WARNING", "ERROR", "CRITICAL"]

def escape_str(s):
    return "'" + s.replace("'", "''") + "'"

def generate_sql():
    sql_statements = []
    
    # Skills
    skills_map = {}
    for name in SKILLS:
        skill_id = str(uuid.uuid4())
        skills_map[name] = skill_id
        sql_statements.append(f"INSERT INTO skills (id, name) VALUES ('{skill_id}', {escape_str(name)});")

    # Campaigns
    campaigns_map = {}
    for name, year in CAMPAIGNS:
        camp_id = str(uuid.uuid4())
        campaigns_map[(name, year)] = camp_id
        sql_statements.append(f"INSERT INTO campaigns (id, name, year) VALUES ('{camp_id}', {escape_str(name)}, {year});")

    # Volunteers
    for _ in range(50):
        vol_id = str(uuid.uuid4())
        name = fake.name()
        email = fake.unique.email()
        phone = fake.phone_number()
        region = random.choice(REGIONS)
        availability = random.choice(["Fines de semana", "Lunes a Viernes", "Mañanas", "Tardes"])
        created_at = fake.date_time_between(start_date='-1y', end_date='now').isoformat()
        
        sql_statements.append(f"INSERT INTO volunteers (id, name, email, phone, region, availability, created_at, updated_at) VALUES ('{vol_id}', {escape_str(name)}, {escape_str(email)}, {escape_str(phone)}, {escape_str(region)}, {escape_str(availability)}, '{created_at}', '{created_at}');")
        
        # Volunteer Skills
        num_skills = random.randint(1, 3)
        chosen_skills = random.sample(list(skills_map.values()), k=num_skills)
        for skill_id in chosen_skills:
            sql_statements.append(f"INSERT INTO volunteer_skills (volunteer_id, skill_id) VALUES ('{vol_id}', '{skill_id}');")

        # Volunteer Campaigns
        num_camps = random.randint(0, 2)
        chosen_camps = random.sample(list(campaigns_map.values()), k=num_camps)
        for camp_id in chosen_camps:
            sql_statements.append(f"INSERT INTO volunteer_campaigns (volunteer_id, campaign_id) VALUES ('{vol_id}', '{camp_id}');")

    # Logs
    for _ in range(20):
        log_id = str(uuid.uuid4())
        source = random.choice(LOG_SOURCES)
        level = random.choice(LOG_LEVELS)
        message = fake.sentence()
        details = '{"ip": "' + fake.ipv4() + '", "user_agent": "' + fake.user_agent() + '"}'
        created_at = fake.date_time_between(start_date='-7d', end_date='now').isoformat()
        
        sql_statements.append(f"INSERT INTO logs (id, source, level, message, details, created_at) VALUES ('{log_id}', '{source}', '{level}', {escape_str(message)}, '{details}', '{created_at}');")

    return "\n".join(sql_statements)

if __name__ == "__main__":
    print(generate_sql())
