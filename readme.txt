//  BACKEND FOLDER STRUCTURE


| Package               | Purpose                                                            |
| --------------------- | ------------------------------------------------------------------ |
| `controller`          | Receives HTTP requests and returns responses                       |
| `service`             | Contains the business logic                                        |
| `repository`          | Communicates with the database using JPA                           |
| `model` (or `entity`) | Represents database tables                                         |
| `dto`                 | Request and response objects (e.g., LoginRequest, RegisterRequest) |
| `config`              | Configuration classes (CORS, Security, etc.)                       |
| `security`            | JWT, authentication, authorization                                 |
| `exception`           | Custom exceptions and global exception handling                    |
| `util`                | Helper classes (JWT utilities, constants, etc.)                    |


//  USER TABLE DESIGN


| Column   | Type   | Why?                               |
| -------- | ------ | ---------------------------------- |
| id       | Long   | Unique ID                          |
| name     | String | User's name                        |
| email    | String | Used for login                     |
| password | String | Store hashed password              |
| role     | Enum   | CUSTOMER, VENDOR, ADMIN, WAREHOUSE |


// ANNOTATIONS


@Entity ---> this class represents a database table
@Table ----> by default spring will create a table like User

if we want a specific table name
@Table(name = 'users')

@Id  -----> id uniquely identifies each row
@GeneratedValue ---> it generates id's automatically

@PostMapping used to This method handles POST requests coming to /auth/register.