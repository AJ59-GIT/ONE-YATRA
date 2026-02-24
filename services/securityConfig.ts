
export const securityArchitecture = {
  layers: [
    {
      name: "Edge Security",
      tech: "Cloudflare WAF",
      desc: "DDoS Protection, Bot Mitigation, Geo-Blocking (Allow India IPs only for specific routes)."
    },
    {
      name: "API Gateway",
      tech: "Kong / Nginx",
      desc: "Rate Limiting, IP Whitelisting, SSL Termination (TLS 1.3), Request Sanitization."
    },
    {
      name: "Identity Provider",
      tech: "Auth0 / Firebase Auth",
      desc: "OIDC compliant, MFA (SMS/Email), Social Login integration."
    },
    {
      name: "Service Mesh",
      tech: "Istio",
      desc: "mTLS between microservices, Zero Trust Network Access (ZTNA)."
    }
  ]
};

export const encryptionStandards = {
  transit: "TLS 1.3 (ChaCha20-Poly1305)",
  rest: "AES-256-GCM (Database & Logs)",
  keys: "AWS KMS / HashiCorp Vault (Key Rotation every 90 days)",
  hashing: "Argon2id for Password Hashing"
};

export const complianceChecklist = [
  {
    category: "India DPDP Act 2023",
    items: [
      { id: 1, text: "Explicit Consent Manager (English + 22 Indian Languages)", status: "Implemented" },
      { id: 2, text: "Data Localization (Servers in Mumbai/Hyderabad)", status: "Implemented" },
      { id: 3, text: "Right to be Forgotten (User deletion API)", status: "Pending Audit" },
      { id: 4, text: "Grievance Redressal Mechanism", status: "Implemented" }
    ]
  },
  {
    category: "RBI & Payments (PCI-DSS)",
    items: [
      { id: 5, text: "Card Tokenization (No raw card data storage)", status: "Implemented" },
      { id: 6, text: "Two-Factor Authentication (2FA) for transactions > ₹2000", status: "Enforced" },
      { id: 7, text: "Payment Data Encryption (HSM integration)", status: "Implemented" }
    ]
  },
  {
    category: "General Security",
    items: [
      { id: 8, text: "Regular VAPT (Vulnerability Assessment)", status: "Scheduled Quarterly" },
      { id: 9, text: "PII Data Masking in Logs", status: "Implemented" }
    ]
  }
];
