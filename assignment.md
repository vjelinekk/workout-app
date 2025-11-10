# 🎯 Project Evaluation and Quality Requirements (Non-Functional)

## 📊 Evaluation Summary

* **Maximum Score:** **50 points**.
* **Passing Minimum Score (for Credit):** **25 points**.
* **Scoring Method:** Points will be **subtracted** for any violation of the defined requirements.

---

## 🛡️ Non-Functional Requirements: System Qualities

These requirements define how well the system performs, is secured, and operates.

* **User Interface (UI):** The service must provide an accessible **web user interface (UI)**.
* **Programmable Interface (API):** The service must expose a structured **API** (e.g., REST or GraphQL) and include comprehensive **API documentation**.
* **Internationalization (i18n):** The web UI must support **multiple languages** (minimum of two) and allow users to **switch between them easily**.
* **Authentication Methods:** Users must be able to log in using **username/password**, plus support at least **one additional robust authentication method** (e.g., passkeys, OAuth2, WebAuthn).
* **Security:** Authentication details (e.g., passwords) must be stored and handled **securely** (e.g., using industry-standard hashing).
* **Deployment:** The service must be designed for **easy, one-command deployment**, preferably utilizing a container orchestration tool like **Docker Compose**.
* **Resource Limits:** The system must enforce necessary **resource limitations**, such as a defined **maximum upload file size** (e.g., 5 MB).
* **External Service Mocking:** Any necessary external communication (e.g., sending emails) should be directed to a **mocked service** for development/testing environments.

---

## 💻 Development & Architecture Quality

These requirements ensure the codebase adheres to professional standards for architecture, maintainability, and testing.

* **Architectural Adherence:** The final implementation must correctly reflect the **selected architectural pattern and design**.
    * *Violation:* Gross misimplementation (e.g., a microservice that isn't a microservice, or poorly secured communication between services).
* **Layer Separation:** The application must demonstrate correct **separation of application layers** (e.g., presentation, business logic, data access).
    * *Violation:* Gross violation of MV* patterns (e.g., data modification directly in the view/controller/presenter, application logic in servlets, or SQL/JPQL/Criteria outside the data access layer).
* **Code Structure:** Methods/functions should be kept to a **reasonable length** (e.g., typically 50-100 lines), allowing for exceptions where complexity dictates.
* **Documentation:** **All significant code components** must be well-commented and documented:
    * Interface methods must have comments.
    * Class headers must be documented.
    * Attributes/data models must have descriptions.
* **Logging:** The system must implement **structured logging** in appropriate areas, utilizing standard **log levels** and a common format.
* **Testing Coverage:** **Critical business logic** must be covered by **automated tests** (including unit and integration tests).
    * *Specifically:* **User management functionality** must include unit tests.
* **Configuration Management:** All system configurations must be read from **external sources** (e.g., property files, environment variables) rather than being hardcoded.
    * *Violation:* Hardcoding credentials/values that should be configurable (e.g., database connection details, email/SMS service details, or various time delays).
* **Interface Programming:** The solution must demonstrate **programming against interfaces** where appropriate.
* **Dependency Injection (DI):** **Dependency Injection** must be used if it makes sense for the chosen technology.
* **Database Query Optimization:** The application must avoid an **unreasonable number of database queries** relative to the required data volume.
    * *Violation:* Gross violation of ORM principles and careless data loading (e.g., loading 50 items one by one). *Note: Exceptional optimization can earn bonus points (1-5b).*
* **Input Handling:** User registration (or similar critical input forms) must include **robust input validation** to prevent exceptions caused by unhandled input.

---

## 🔄 Evaluation and Correction Process

### Rework Conditions (Automatic Rework Required)

The work will be automatically returned for reworking/correction with a point penalty if any of the following are found:

* The work is missing any of the required basic functional features described in the main assignment. **(-7 points penalty)**
* The work contains any of the severe architectural/coding errors listed above. **(-7 points penalty)**
* The final score is insufficient to grant course credit (i.e., less than 25 points). **(-0 points penalty)**