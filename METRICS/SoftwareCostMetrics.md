## SOFTWARE COST METRICS
Software cost metrics is simply a way to measure and estimate how expensive it is to build and maintain software.

## Purpose of This Document

The purpose of this document is to demonstrate how software cost estimation was applied in our project FinFriend.

For FinFriend, estimation helped us to:

- plan the work before implementation,
- break the system into manageable parts,
- estimate the development effort for each feature,
- identify areas that could increase cost,
- and support realistic project scheduling.

The estimation was was based on the size of the system, the nature of the features, and the project constraints.

## Estimation Approach Used

The cost estimation for our project was based on the following:

### 1. Size as the Starting Point
In FinFriend, project size was measured by the number of major features rather than by lines of code alone.
That is;

- Learning modules introduce content pages, quiz logic, and progress tracking.
- Financial tools introduce calculations and user inputs.
- Forum features introduce posting, replying, and moderation logic.
- Gamification introduces XP, badges, and leaderboard updates.

This means the project size is not just the number of files. It is the amount of functionality that must be delivered.

### 2. Complexity Affects Effort
Not all features required the same amount of effort.

The content page wass easier to build than the dashboard that combines user statistics from other multiple modules.
The calculator was easier to develop than the forum with replies, notifications, and ranking logic.

This matches the software metrics principle that complexity increases effort.

### 3. Reuse Reduces Cost
Some parts of FinFriend were reused across the system.
We reused;

- shared layout and navigation,
- reusable form validation,
- common database connection logic,
- reusable dashboard components,
- repeated UI styling.

Reuse reduces implementation time and lowers cost.


## Project Breakdown for Estimation

The FinFriend system was divided into smaller parts for easier estimation.

| Component | Main Work Required | Relative Effort |
|----------|--------------------|-----------------|
| Landing pages | Static content, navigation, styling | Low |
| Learning modules | Content delivery, quizzes, progress updates | Medium |
| Financial tools | Form input, calculations, validation | Medium |
| Forum | Posting, replying, display logic, moderation | High |
| Expert blog | Content pages, formatting, updates | Medium |
| Gamification | XP, badges, leaderboard logic | High |
| Dashboard | Aggregation of user progress and results | High |
| Authentication | Login, registration, session handling | Medium to High |
| Database integration | Storage, retrieval, updates, relationships | High |

This breakdown made it easier to estimate each part separately and then combine them into the overall project estimate.

---

## Estimation Method Used in Practice

The project followed a simple estimation process:

1. Identify the major features.
2. Break each feature into smaller tasks.
3. Estimate the effort for each task.
4. Add the estimates together.
5. Adjust the total based on complexity, reuse, and risk.
6. Review and update the estimate as the project develops.

---

## Factors That Increased the Estimated Cost

Some aspects of FinFriend increased the cost of development:

- the platform serves a specific target group and must be user-friendly,
- the forum requires dynamic interaction,
- the gamification system needs accurate state tracking,
- the dashboard must summarize many different user actions,
- the financial tools must return correct outputs,
- the project requires good validation and secure data handling.

These features were very essential, but also more expensive to build.

---

## Factors That Reduced the Estimated Cost

Some aspects lowered the cost:

- repeated UI structure across pages,
- reuse of shared styles and layout components,
- modular separation of pages and features,
- use of standard web development patterns,
- availability of existing educational content for the blog and modules.

These reduce duplication and simplify implementation.

---

## Limitations of the Estimate

The estimate for FinFriend has some limitations:

- some risks were difficult to predict in the planning phase like the gamification module was actually trickier than anticipated at first,

---

## Conclusion

In FinFriend, the most expensive parts of the system were the forum, dashboard, gamification, authentication, and database integration.