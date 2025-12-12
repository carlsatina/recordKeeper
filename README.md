# MECLogger – Personal History & Records Tracker

meclogger is a simple, central place to store the important “history” of your life:

- **Medical data** – blood sugar readings, prescriptions, doctor visits  
- **Car maintenance** – services, repairs, mileage, important dates  
- **Address book** – people, phone numbers, emails, and notes  
- **Expenses** – daily spending, categories, and basic summaries  

Instead of using separate apps or notes for each of these, MyApp keeps everything in one organized system.

---

## Key Features

### 1. Medical History

- Save **blood sugar** readings with date and time  
- Record **medical prescriptions** (medicine name, dosage, schedule, doctor)  
- Track **appointments** or **check-ups** with notes and results  
- Optional tags like _“Diabetes”_, _“Cardiology”_ to group records

### 2. Car Maintenance History

- Store **service logs** (oil change, tire rotation, inspections, repairs)  
- Track **odometer readings** and service intervals  
- Add **notes and cost** for each maintenance entry  
- See a quick history of everything done to the car

### 3. Address Book

- Keep a personal **address book** of contacts  
- Store **name, phone, email, physical address**, and custom notes  
- Useful for family, doctors, mechanics, emergency contacts, etc.

### 4. Expense Records

- Log **daily expenses** with amount, date, and category  
- Categories like **Food, Transport, Medical, Car, Utilities, Others**  
- View basic summaries or filters (e.g., expenses by month or category)

### 5. Unified History

- All data types share a common idea: **date-based history**  
- Easily look back at:
  - What medicine you were taking on a specific date  
  - What work was done on your car last year  
  - When you last updated a contact  
  - How much you spent in a given month  

---

## Data Model (Conceptual)

> Note: This is a high-level overview; adapt names to match your actual code.

- `User`  
- `MedicalRecord` (type, value, notes, date, tags)  
- `Prescription` (medicineName, dosage, frequency, startDate, endDate, doctor)  
- `CarRecord` (carId, typeOfService, mileage, cost, date, notes)  
- `Contact` (name, phone, email, address, notes)  
- `Expense` (amount, category, date, notes)

---

## Why this app?

Most people use different tools for medical notes, car maintenance logs, contacts, and expenses.  
MyApp tries to **simplify life** by giving:

- **One app** for multiple types of personal records  
- **Consistent history view** (everything is time-based)  
- A simple way to **look back** and answer questions like:
  - “When was my last blood test?”  
  - “When did I change my car’s oil?”  
  - “Where does this person live again?”  
  - “How much did I spend on medical bills this month?”

---

## Tech Stack

> Update this section with your actual technologies.

- Frontend: `...`  
- Backend: `...`  
- Database: `...`  

---

## Roadmap / Future Ideas

- Reminders for:
  - Prescription refills  
  - Upcoming car services  
- Export data to CSV/PDF  
- Simple charts for blood sugar and expenses  
- Cloud sync / multi-device support  

---

## Privacy

This app deals with **sensitive personal data** (especially medical information).  
Make sure to:

- Store data securely  
- Use encryption where possible  
- Never share user data without consent
