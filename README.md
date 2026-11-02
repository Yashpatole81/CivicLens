# CivicLens 🌍

### Turn a Photo Into Action. Make Your City Better.

**CivicLens** is an AI-assisted civic issue reporting and complaint
management platform. It helps residents report everyday urban problems
using a photograph, location, and a short description. The platform is
designed to turn these reports into structured, trackable service
requests and give municipal teams a centralized place to review, assign,
and manage complaints.

> **Our vision:** Make civic reporting effortless, municipal workflows
> transparent, and communities better places to live.

------------------------------------------------------------------------

## The Problem

A pothole on the daily commute. A broken streetlight outside a home. An
overflowing public bin that nobody seems to address.

Reporting these problems can be frustrating. Residents may not know
which department to contact, may need to manually describe the issue and
its location, and often have little visibility into what happens after
submitting a complaint.

Municipal teams, meanwhile, may receive incomplete reports, duplicate
complaints, and unstructured information that makes prioritization
difficult.

**CivicLens aims to bridge the gap between residents and city
services.**

## The Solution

CivicLens is designed to turn a simple photograph into an actionable
civic complaint.

1.  **Capture** --- Photograph a civic issue through the mobile
    application.
2.  **Locate** --- Attach the device's current GPS coordinates, with the
    resident's permission.
3.  **Understand** --- Use multimodal AI to suggest an issue category,
    assess severity, and generate a structured complaint.
4.  **Route** --- Recommend the appropriate municipal department using
    AI-assisted classification and validated routing rules.
5.  **Track** --- Generate a unique complaint reference and show status
    changes in a ticket-style timeline.
6.  **Resolve** --- Allow authorized officers to manage complaints,
    publish updates, and record resolutions.

The goal is simple: **less friction for residents, better information
for officials, and greater transparency for everyone.**

------------------------------------------------------------------------

## Features

### Resident Experience

-   Secure sign-up and login.
-   Camera-first issue reporting.
-   GPS-based location capture with permission.
-   AI-assisted issue classification and complaint summaries.
-   Review and correction of AI-generated details before submission.
-   Unique reference for each submitted complaint.
-   Complaint tracking with department assignment and status history.
-   Live status updates.
-   Resolution notes and history.

### Municipal Officer Experience

-   Centralized complaint queue.
-   Department-based complaint assignment.
-   Complaint filtering and search.
-   Access to submitted photographs, descriptions, and location
    information.
-   Status transitions and resident-visible progress updates.
-   Internal notes separated from public updates.
-   Complaint reassignment and resolution records.

### Administrative Dashboard

-   Overview of submitted, pending, active, and resolved complaints.
-   Complaint distribution by department and category.
-   Recent complaint activity.
-   Workload visibility across departments.
-   Operational insights into recurring civic issues.

### AI-Assisted Intelligence

-   Image-based civic issue understanding.
-   Structured complaint generation.
-   Suggested department routing.
-   Severity recommendations with uncertainty handling.
-   Structured-output validation.
-   Manual fallback when AI inference is unavailable.

AI outputs are recommendations, not verified facts. Residents and
authorized officials should retain control over corrections and final
decisions.

------------------------------------------------------------------------

## How It Works

``` mermaid
flowchart TD
    A[Resident Opens CivicLens] --> B[Sign Up or Log In]
    B --> C[Capture Civic Issue Photo]
    C --> D[Obtain GPS Coordinates]
    D --> E[Add Optional Description]
    E --> F[AI Image Analysis]
    F --> G[Review and Correct Details]
    G --> H[Submit Complaint]
    H --> I[Create Unique Ticket]
    I --> J[Route to Department]
    J --> K[Officer Reviews Complaint]
    K --> L[Status and Progress Updates]
    L --> M[Resident Tracks Complaint]
    L --> N[Officer Records Resolution]
    N --> O[Resident Views Resolution]
```

### Example: Reporting a Pothole

1.  A resident photographs a pothole.
2.  CivicLens obtains the resident's current GPS coordinates with
    permission.
3.  AI suggests a road-damage category, generates a complaint summary,
    and recommends the relevant department.
4.  The resident reviews the details and submits the complaint.
5.  CivicLens creates a complaint reference and routes the ticket
    according to configured rules.
6.  An authorized officer reviews the ticket and updates its status.
7.  The resident follows progress through the complaint timeline.
8.  The officer records the resolution, which becomes part of the
    complaint history.

------------------------------------------------------------------------

## Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Mobile application      Expo + React Native     Cross-platform Android
                                                  and iOS experience

  Programming language    TypeScript              Type-safe application
                                                  development

  Navigation              Expo Router             Screen navigation and
                                                  routing

  Backend platform        Supabase                Managed backend
                                                  infrastructure

  Database                PostgreSQL via Supabase Complaints, users,
                                                  departments, and status
                                                  history

  Authentication          Supabase Auth           User authentication and
                                                  session management

  File storage            Supabase Storage        Complaint photographs

  Realtime                Supabase Realtime       Live complaint status
                                                  synchronization

  Access control          PostgreSQL Row-Level    Data access permissions
                          Security                

  AI inference            Configurable AI         Multimodal
                          provider                understanding and
                                                  structured
                                                  recommendations
  -----------------------------------------------------------------------

The table describes the intended technology architecture. Confirm the
providers, integrations, and features against the current implementation
before treating them as deployed capabilities.

------------------------------------------------------------------------

## Architecture

``` mermaid
flowchart TB
    subgraph Clients
        A[Resident Mobile App]
        B[Officer and Admin Interface]
    end

    subgraph Backend
        C[Supabase Auth]
        D[Secure Server-Side Operations]
        E[PostgreSQL Database]
        F[Private Photo Storage]
        G[Realtime Updates]
    end

    subgraph AI
        H[Configured AI Provider]
        I[Structured Output Validation]
        J[Department Routing Rules]
    end

    A --> C
    B --> C
    A --> D
    B --> D
    D --> E
    D --> F
    D --> H
    H --> I
    I --> J
    J --> E
    E --> G
    G --> A
    G --> B
```

### Architecture Principles

-   Keep AI-provider credentials out of the mobile application.
-   Enforce permissions at database and trusted server-side boundaries.
-   Store complaint photographs in private storage.
-   Separate AI suggestions from resident-confirmed information and
    official decisions.
-   Use deterministic routing rules to validate department assignments.
-   Maintain a timestamped audit trail for important complaint updates.
-   Handle AI failures without losing complaint data or blocking manual
    reporting.

------------------------------------------------------------------------

## Complaint Categories

The initial category set can be configured for the needs of a city or
municipality.

  -----------------------------------------------------------------------
  Category                            Example Department
  ----------------------------------- -----------------------------------
  Potholes and road damage            Roads / Public Works

  Broken streetlights                 Street Lighting

  Illegal dumping and overflowing     Waste Management
  bins                                

  Blocked sidewalks and accessibility Public Works / Accessibility
  issues                              

  Traffic infrastructure problems     Traffic Department

  Uncertain or unsupported issues     General Municipal Review
  -----------------------------------------------------------------------

Department names and routing rules are examples. They should be adapted
to the relevant municipality and are not an indication of an official
municipal-system integration.

------------------------------------------------------------------------

## Security and Privacy

CivicLens is designed around responsible handling of resident data. The
following controls should be implemented and verified before production
use:

-   **Authentication:** Account management through Supabase Auth.
-   **Row-Level Security:** Residents can access only their permitted
    records; officers and administrators receive role-specific access.
-   **Role Protection:** Privileged roles cannot be self-assigned by
    ordinary users.
-   **Private Media:** Complaint photographs are stored in private
    storage with controlled access.
-   **Secret Management:** AI-provider secrets and service-role
    credentials remain server-side.
-   **Location Privacy:** GPS coordinates are collected for complaint
    reporting with clear permission handling.
-   **Data Minimization:** Collect only information needed to submit and
    manage a complaint.
-   **Auditability:** Record important status transitions and
    administrative actions.
-   **AI Transparency:** Let users review AI-generated suggestions and
    correct errors.

Do not consider these controls production-ready until they have been
implemented and tested.

------------------------------------------------------------------------

## Getting Started

The following is a general development setup. Exact dependencies,
scripts, and environment variables may differ depending on the
repository's current implementation.

### Prerequisites

-   Node.js LTS
-   npm
-   Expo Go or an Android/iOS development environment
-   A Supabase project
-   Credentials for an AI provider, if AI inference is enabled

### 1. Clone the Repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd CivicLens
```

Replace `<YOUR_REPOSITORY_URL>` with the repository's clone URL.

### 2. Install Dependencies

``` bash
npm install
```

If the repository uses a monorepo or separate application directories,
follow the package instructions for the relevant directory.

### 3. Configure Supabase

Create a Supabase project and configure the services used by the
application:

-   Authentication
-   PostgreSQL schema and migrations
-   Row-Level Security policies
-   Private photo storage
-   Realtime publication and subscriptions

Create a local environment configuration using the variables required by
the application.

Example:

``` env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

Use only the appropriate public client key in the mobile application.
Never put a Supabase service-role key or AI-provider secret in an
`EXPO_PUBLIC_` variable.

### 4. Configure AI Inference

Configure the selected AI provider through a trusted server-side
environment.

Before enabling AI-powered complaint analysis, verify:

-   Provider credentials and access.
-   Supported models and input formats.
-   Response structure and schema validation.
-   Rate limits, timeouts, and error handling.
-   Data handling and privacy requirements.

If credentials or access are unavailable, use a clearly identified mock
response or manual categorization fallback during development.

### 5. Run the Application

For a standard Expo project:

``` bash
npx expo start
```

Follow the Expo development server instructions to open the application
on a supported device or simulator.

**Note:** Confirm the actual scripts and setup steps in the repository
before using these commands.

------------------------------------------------------------------------

## Future Improvements

Potential areas for future development include:

-   Multilingual reporting and localized interfaces.
-   Map-based civic issue discovery.
-   Duplicate complaint detection.
-   Public dashboards for aggregated, privacy-preserving civic insights.
-   Automated summaries of recurring infrastructure problems.
-   Configurable municipal workflows and service-level targets.
-   Additional AI providers and optimized inference deployments.
-   Integration with municipal systems through authorized APIs.

------------------------------------------------------------------------

## Project Status

CivicLens is an evolving project. The availability and maturity of
individual features, AI integrations, security controls, and municipal
workflows depend on the current implementation. Refer to the repository
and release notes for the latest working capabilities.

## Contributing

Contributions, feedback, and ideas are welcome.

Areas where contributions may be useful:

-   Mobile UX and accessibility.
-   AI classification and structured outputs.
-   Supabase schema and access control.
-   Complaint workflow design.
-   Testing and reliability.
-   Civic technology research.

For significant changes, open an issue to discuss the proposal before
submitting a pull request.

## License

No open-source license has been specified yet. Until a `LICENSE` file is
added, the project's reuse and redistribution permissions are not
explicitly granted. Add an appropriate license before distributing the
project as open source.

------------------------------------------------------------------------

**CivicLens --- Turn a Photo Into Action. Make Your City Better.**
