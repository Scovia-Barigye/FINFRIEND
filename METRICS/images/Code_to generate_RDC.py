"""FinFriend Reliability Demonstration Chart.

Parameters (from Reliability_Models.md, Section 12):
    lambda_F = 0.04 failures/hour  (Failure Intensity Objective)
    alpha    = 0.10                (Supplier risk)
    beta     = 0.10                (Consumer risk)
    gamma    = 2                   (Discrimination ratio)

SPRT decision boundaries on (normalized_time, failure_number):
    slope     = (gamma - 1) / ln(gamma)
    accept    = slope * T + ln(beta / (1 - alpha)) / ln(gamma)
    reject    = slope * T + ln((1 - beta) / alpha) / ln(gamma)
"""

import os
import math
import matplotlib.pyplot as plt
import numpy as np

ALPHA = 0.10
BETA = 0.10
GAMMA = 2
LAMBDA_F = 0.04

slope = (GAMMA - 1) / math.log(GAMMA)
accept_intercept = math.log(BETA / (1 - ALPHA)) / math.log(GAMMA)
reject_intercept = math.log((1 - BETA) / ALPHA) / math.log(GAMMA)

failures = [
    (2302 / 3600 * LAMBDA_F, 1),
    (8647 / 3600 * LAMBDA_F, 2),
]

T = np.linspace(0, 6, 200)
accept_line = slope * T + accept_intercept
reject_line = slope * T + reject_intercept

fig, ax = plt.subplots(figsize=(9, 6))

ax.fill_between(T, reject_line, 12, color="#f4c2c2", alpha=0.6, label="Reject")
ax.fill_between(T, accept_line, reject_line, color="#fff3b0", alpha=0.6,
                label="Continue Testing")
ax.fill_between(T, -1, accept_line, color="#c8e6c9", alpha=0.6, label="Accept")

ax.plot(T, accept_line, color="#2e7d32", linewidth=1.5)
ax.plot(T, reject_line, color="#c62828", linewidth=1.5)

xs = [p[0] for p in failures]
ys = [p[1] for p in failures]
ax.plot(xs, ys, "o-", color="#1565c0", markersize=8, linewidth=1.5,
        label="Observed failures")

for x, y in failures:
    ax.annotate(f"({x:.3f}, {y})", (x, y), textcoords="offset points",
                xytext=(8, 8), fontsize=9, color="#1565c0")

ax.set_xlim(0, 6)
ax.set_ylim(0, 11)
ax.set_xlabel("Normalized failure time  (t × λF)")
ax.set_ylabel("Failure number")
ax.set_title("FinFriend – Reliability Demonstration Chart\n"
             f"λF = {LAMBDA_F}/hr,  α = β = {int(ALPHA*100)}%,  γ = {GAMMA}")
ax.grid(True, linestyle="--", alpha=0.4)
ax.legend(loc="upper left", framealpha=0.95)

plt.tight_layout()
out_path = os.path.join(os.path.dirname(__file__),
                        "reliability_demonstration_chart.png")
plt.savefig(out_path, dpi=150)
print(f"Saved {out_path}")
