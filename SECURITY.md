# Security Policy

## 🔢 Supported Versions

| Version  | Supported?           | Support Level             | Security Updates Until |
|----------|----------------------|---------------------------|------------------------|
| 5.1.x    | ✅ Actively Supported  | Full Feature & Security   | Ongoing               |
| 5.0.x    | ✅ Supported           | Security Updates Only     | Until December 2025   |
| 4.0.x    | ✅ Limited Support     | Critical Fixes Only       | Until June 2025       |
| < 4.0    | ❌ Not Supported       | End of Life (EOL)         | -                     |


### Security Policy

### **Reporting a Vulnerability**

We take security seriously. If you have discovered a potential security vulnerability, we **strongly encourage** you to report it **privately and responsibly** so we can address it promptly.

#### **How to Report**

*    **Email:** security@helloblue.ai
*    **Report via GitHub Security Advisory:** [Submit Here](https://github.com/HelloblueAI/hbLab-B01/security/advisories)


 **Do NOT disclose security issues publicly** before we have had a chance to investigate and deploy a fix.

### **⏳ Response & Resolution Process**

Once a report is received, we follow a structured response process:

1.  **Initial Acknowledgment (Within 48 Hours)**

    *   We confirm receipt of your report.
    *   We may ask for **additional details** or proof of concept (PoC).

2.  **Investigation & Risk Assessment**

    *   Our security team will **reproduce** the issue and evaluate its severity.
    *   If valid, we prioritize it based on impact.

3.  **Fix Development & Testing**

    *   A security patch will be developed, reviewed, and tested.
    *   Where necessary, we coordinate **responsible disclosure** timelines with the reporter.

4.  **Deployment & Public Disclosure**
    *   The fix is rolled out via **a security update.**
    *   We may publish a **CVE (Common Vulnerabilities and Exposures) identifier** if applicable.
    *   The issue may be **acknowledged in release notes** (if the reporter consents).

### ** Acknowledgment & Recognition**
We value security researchers who help us keep our platform safe. If you responsibly disclose a vulnerability, you may be **publicly credited** for your findings (if you wish).Additionally, high-impact vulnerabilities may qualify for **Hall of Fame recognition** or **future collaboration opportunities.** 🎖️

**Responsible Disclosure Rewards** (non-monetary) may include:✔️ **Special Mention in Release Notes**✔️ **LinkedIn or GitHub Recognition**✔️ **Early Access to Security Previews**

### **Guidelines for Responsible Disclosure**

To ensure a **secure and efficient resolution process**, please follow these guidelines when reporting vulnerabilities:

✔️ **Provide Detailed Reports**

*   Include **step-by-step reproduction steps**, a **Proof of Concept (PoC)**, and a clear **impact analysis**.

✔️ **Respect Responsible Disclosure Timelines**

*   Allow us **adequate time to investigate and fix** the issue **before public disclosure**.

✔️ **Use Ethical Testing Methods**

*   **Avoid automated scanners, brute-force attacks, or denial-of-service (DoS) testing**, as these can disrupt services.

✔️ **Limit Exploitation to Demonstration Only**

*   Do not **exploit the vulnerability beyond what is necessary** to prove its impact.

### **Out of Scope Reports**

The following types of reports **are not considered security vulnerabilities** and will not be eligible for review:

### **🔹 Non-Exploitable Vulnerabilities**

*   Issues like **missing X-Frame-Options on non-sensitive pages** that do not pose an actual risk.

### **🔹 Self-XSS (Reflected Only to the Attacker)**

*   Cross-site scripting (XSS) attacks that **only affect the attacker themselves** and cannot be exploited against others.

### **🔹 Denial of Service (DoS) via Rate Limiting**

*   Automated or manual **DoS attempts** using excessive API requests that are already mitigated by **rate limits**.

### **🔹 Reports Involving Outdated Browsers & Plugins**

*   Security issues affecting **obsolete browsers or unsupported third-party plugins** not in mainstream use.

### **🔹 Social Engineering, Spamming, or Phishing Attacks**

*   **Non-technical attacks**, such as phishing, impersonation, or **attempts to deceive users into sharing credentials**.















