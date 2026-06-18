"""
Run: python seed.py
Creates sample organizers and one person to get started.
"""
from sqlmodel import Session, select
from app.database import engine, create_db_and_tables
from app.models import Organizer, Person


def seed():
    create_db_and_tables()
    with Session(engine) as session:
        if not session.exec(select(Organizer)).first():
            session.add(Organizer(nombre="Organizador Uno", whatsapp="5492235550001"))
            session.add(Organizer(nombre="Organizador Dos", whatsapp="5492235550002"))
            session.commit()
            print("Organizadores creados.")

        if not session.exec(select(Person)).first():
            session.add(
                Person(
                    nombre="Demo",
                    apellido="Usuario",
                    email="demo@example.com",
                    whatsapp="5492235550099",
                )
            )
            session.commit()
            print("Persona demo creada.")

    print("Seed completado.")


if __name__ == "__main__":
    seed()
