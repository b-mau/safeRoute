import csv
import random

# Generamos una lista de 999 códigos LSOA (E01000001 a E01000999)
lsoa_list = [f"E010{str(i).zfill(5)}" for i in range(1, 1000)]

# Lista de días de la semana
days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

def generate_time():
    # Genera un minuto total aleatorio del día (0 a 1439)
    total_minutes = random.randint(0, 1439)
    hour = total_minutes // 60
    minute = total_minutes % 60
    return hour, minute, f"{hour:02d}:{minute:02d}"

# Abrimos (o creamos) el archivo CSV para escribir el dataset
with open("data/raw_data2.csv", mode="w", newline="") as file:
    writer = csv.writer(file)
    # Escribimos la cabecera
    #writer.writerow(["lsoa_a", "lsoa_b", "day", "hour", "label"])
    
    for _ in range(100000):
        lsoa_a = random.choice(lsoa_list)
        lsoa_b = random.choice(lsoa_list)
        day = random.choice(days)
        hour, minute, time_str = generate_time()
        # Convertimos la hora a formato decimal para facilitar las comparaciones
        t = hour + minute / 60.0
        
        # Definimos la probabilidad del crimen (LABEL=1) según la hora y el día:
        if 6 <= t < 20:
            p = 0.10  # Día: baja probabilidad
        else:
            p = 0.70  # Noche/madrugada: probabilidad mayor
            # Si es viernes o sábado y es madrugada (00:00-05:59), aumentamos la probabilidad
            if day in ["Friday", "Saturday"] and t < 6:
                p = 0.90
        
        # Se asigna LABEL=1 con probabilidad p, sino LABEL=0
        label = 1 if random.random() < p else 0
        
        writer.writerow([lsoa_a, lsoa_b, day, time_str, label])
