# FinFriend – Software Quality

Implementing software quality metrics involves transitioning from a broad concept of "good software" to a structured, measurable system. Our development process is data-driven and conforms to recognized international standards, ensuring that high quality is built-in from the design phase through a multi-step quality modeling process.

## 1. Select or Define a Quality Model
The project adopts a hybrid approach, drawing from established frameworks:
- **ISO 9126**: The most comprehensive standard, categorizing quality into six main characteristics: Functionality, Reliability, Usability, Efficiency, Maintainability, and Portability.
- **CUPRIMDA**: Focuses on eight specific parameters to prioritize roadmap development: Capability, Usability, Performance, Reliability, Installability, Maintainability, Documentation, and Availability.
- **McCall’s Model**: Used to clearly distinguish between **Quality Factors** (what the user sees), **Quality Criteria** (what the developer builds), and **Quality Metrics** (the scales used for measurement).

## 2. Map Attributes to Specific Metrics
To maintain rigorous quality control, we map quality factors to concrete, measurable criteria depending on the stage of software development:
- **Early Stage (Non-executable):** Characterized by **Internal Metrics** derived directly from the design and code.
  - *Analyzability*: Measured by the Cyclomatic number or comment rate.
  - *Changeability*: Measured by the number of nested levels or average size of statement.
- **Later Stage (Executable):** Characterized by **External Metrics** derived from the behavior of the running system during testing.
  - *Accuracy*: Measured by the number of system faults per time period.
  - *Security*: Measured by the Security Level (Lsc), representing the ratio of successful intrusions to total attempts.
- **Post-Release:** Characterized by **Quality-in-Use Metrics** to measure user effectiveness, productivity, and satisfaction in real-world conditions.

## 3. Measurable Objectives
We systematically benchmark key attributes to ensure stable and predictable operations. 

| Quality Attribute | Metric                      | Worst Case | Planned Target | Best Case |
|-------------------|-----------------------------|------------|----------------|-----------|
| **Reliability**   | System Uptime / Availability| 95.0%      | 99.0%          | 99.9%     |
| **Maintainability**| Cyclomatic Complexity (Avg)| 15         | < 10           | < 5       |
| **Performance**   | API Response Time           | 800ms      | < 300ms        | < 100ms   |
| **Security**      | Successful Intrusion Ratio  | < 0.1%     | 0% (blocked)   | 0%        |

## 4. Implement Process-Oriented Metrics
To improve how we build software, we track attributes of our development process alongside the product itself:
- **Defect Distributions:** We track where defects are injected versus where they are detected (e.g., Requirements, Design, or Coding) to proactively reduce the number of defects that cross process boundaries.
- **Effort Distribution:** We monitor how much time is spent on "normal" activity versus "rework" triggered by tests or coding errors. The goal is to detect, analyze, and continuously reduce this rework.

## 5. Measure Customer Satisfaction
For long-term success, we directly link our technical metrics with user perception through active monitoring and surveys:
- **Data Collection:** We gather feedback using mail questionnaires, telephone interviews, or face-to-face meetings. We utilize **Simple Random Sampling** or **Systematic Sampling** to ensure our data represents the user base accurately.
- **Analyze Priorities:** We employ statistical methods like **Regression Analysis** on the CUPRIMDA parameters to determine which specific attributes (like Reliability or Usability) most heavily influence overall satisfaction. This enables us to prioritize our development roadmap enhancements where they will have the most impact.
