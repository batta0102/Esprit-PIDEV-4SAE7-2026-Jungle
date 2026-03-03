# Tests Advanced API – Présences et progrès

Base URL : **http://localhost:8098**

Prérequis : un cours **ONSITE** avec **courseId=1** et au moins **5 sessions** (ids 1, 2, 3, 4, 5).  
Sinon, adapter `courseId` et `sessionId` dans les requêtes.

---

## 1. Marquer 5 présences (PRESENT / ABSENT / PRESENT / PRESENT / EXCUSED)

```bash
# Session 1 – PRESENT
curl -X POST http://localhost:8098/advanced/attendance/mark \
  -H "Content-Type: application/json" \
  -d '{"sessionType":"ONSITE","sessionId":1,"studentId":1,"status":"PRESENT","note":""}'

# Session 2 – ABSENT
curl -X POST http://localhost:8098/advanced/attendance/mark \
  -H "Content-Type: application/json" \
  -d '{"sessionType":"ONSITE","sessionId":2,"studentId":1,"status":"ABSENT","note":""}'

# Session 3 – PRESENT
curl -X POST http://localhost:8098/advanced/attendance/mark \
  -H "Content-Type: application/json" \
  -d '{"sessionType":"ONSITE","sessionId":3,"studentId":1,"status":"PRESENT","note":""}'

# Session 4 – PRESENT
curl -X POST http://localhost:8098/advanced/attendance/mark \
  -H "Content-Type: application/json" \
  -d '{"sessionType":"ONSITE","sessionId":4,"studentId":1,"status":"PRESENT","note":""}'

# Session 5 – EXCUSED
curl -X POST http://localhost:8098/advanced/attendance/mark \
  -H "Content-Type: application/json" \
  -d '{"sessionType":"ONSITE","sessionId":5,"studentId":1,"status":"EXCUSED","note":""}'
```

---

## 2. Appel GET /advanced/progress

```bash
curl -X GET "http://localhost:8098/advanced/progress?courseType=ONSITE&courseId=1&studentId=1"
```

---

## 3. Réponse attendue pour /advanced/progress

Avec **5 sessions** au total et **4** marquées PRESENT ou EXCUSED (sessions 1, 3, 4, 5) :

- **totalSessions** = 5  
- **presentOrExcused** = 4  
- **attendanceRate** = 80.0  
- **eligible** = true (seuil par défaut 80 %)

Exemple de corps de réponse :

```json
{
  "courseType": "ONSITE",
  "courseId": 1,
  "studentId": 1,
  "totalSessions": 5,
  "presentOrExcused": 4,
  "attendanceRate": 80.0,
  "eligible": true
}
```

---

## Résumé

| Session | Status   | Compté presentOrExcused |
|--------|----------|---------------------------|
| 1      | PRESENT  | oui                       |
| 2      | ABSENT   | non                       |
| 3      | PRESENT  | oui                       |
| 4      | PRESENT  | oui                       |
| 5      | EXCUSED  | oui                       |

→ 4 / 5 = **80 %** → **eligible = true**.
