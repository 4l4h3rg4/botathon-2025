import asyncio
import random
from app.core.database import AsyncSessionLocal
from app.models.volunteer import Volunteer, Skill, Campaign
from app.models.log import Log, LogSource, LogLevel
from app.models.segment import Segment
from faker import Faker
from datetime import datetime, timedelta

fake = Faker('es_ES')

SKILLS = ["Primeros Auxilios", "Logística", "Cocina", "Conducción", "Psicología", "Rescate", "Idiomas", "Informática"]
REGIONS = ["Metropolitana", "Valparaíso", "Biobío", "Araucanía", "Los Lagos"]
CAMPAIGNS = [("Campaña Invierno", 2024), ("Incendios Forestales", 2024), ("Navidad Solidaria", 2023), ("Vuelta a Clases", 2024)]

async def create_sample_data():
    async with AsyncSessionLocal() as session:
        print("Creating Skills...")
        skills_map = {}
        for name in SKILLS:
            skill = Skill(name=name)
            session.add(skill)
            skills_map[name] = skill
        
        print("Creating Campaigns...")
        campaigns_map = {}
        for name, year in CAMPAIGNS:
            campaign = Campaign(name=name, year=year)
            session.add(campaign)
            campaigns_map[(name, year)] = campaign
            
        await session.commit()
        
        print("Creating Volunteers...")
        for _ in range(50):
            v = Volunteer(
                name=fake.name(),
                email=fake.unique.email(),
                phone=fake.phone_number(),
                region=random.choice(REGIONS),
                availability=random.choice(["Fines de semana", "Lunes a Viernes", "Mañanas", "Tardes"]),
                created_at=fake.date_time_between(start_date='-1y', end_date='now')
            )
            
            # Add random skills
            v.skills = random.sample(list(skills_map.values()), k=random.randint(1, 3))
            
            # Add random campaigns
            v.campaigns = random.sample(list(campaigns_map.values()), k=random.randint(0, 2))
            
            session.add(v)
            
        print("Creating Logs...")
        for _ in range(20):
            log = Log(
                source=random.choice(list(LogSource)),
                level=random.choice(list(LogLevel)),
                message=fake.sentence(),
                details={"ip": fake.ipv4(), "user_agent": fake.user_agent()},
                created_at=fake.date_time_between(start_date='-7d', end_date='now')
            )
            session.add(log)

        await session.commit()
        print("Sample data created successfully!")

if __name__ == "__main__":
    asyncio.run(create_sample_data())
