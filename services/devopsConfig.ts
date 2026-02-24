
export const cicdPipeline = [
  { stage: "Source", tool: "GitHub", desc: "Push to main branch triggers workflow.", icon: "GitBranch" },
  { stage: "Build", tool: "Docker", desc: "Multi-stage build, linting, unit tests.", icon: "Package" },
  { stage: "Security", tool: "Trivy / SonarQube", desc: "Image scanning, SAST/DAST.", icon: "ShieldCheck" },
  { stage: "Deploy (Staging)", tool: "ArgoCD", desc: "Sync Helm charts to Staging Cluster.", icon: "RefreshCw" },
  { stage: "Test", tool: "K6 / Selenium", desc: "Load testing & E2E integration tests.", icon: "CheckCircle" },
  { stage: "Release (Prod)", tool: "Blue/Green", desc: "Traffic shifting via Istio.", icon: "Globe" }
];

export const k8sArchitecture = {
  ingress: "AWS ALB / Nginx Ingress Controller",
  mesh: "Istio (mTLS, Traffic Splitting, Circuit Breaking)",
  nodes: [
    { name: "Node Pool: General", type: "t3.medium", count: "3-10", purpose: "API, Web, Auth Services" },
    { name: "Node Pool: Compute", type: "c5.large", count: "2-20", purpose: "Pricing Engine, AI Models" },
    { name: "Node Pool: Memory", type: "r5.large", count: "3-5", purpose: "Redis, Elasticsearch" }
  ],
  scaling: {
    hpa: "Horizontal Pod Autoscaler: Scale pods if CPU > 70% or RAM > 80%",
    ca: "Cluster Autoscaler: Provisions new EC2 nodes when pods are pending",
    keda: "KEDA: Event-driven scaling based on Kafka consumer lag (for bookings)"
  }
};

export const monitoringStack = [
  { name: "Prometheus", type: "Metrics", desc: "Scrapes /metrics from NestJS & Nodes", color: "text-orange-600", bg: "bg-orange-100" },
  { name: "Grafana", type: "Visualization", desc: "Dashboards for RPS, Latency, Error Rates", color: "text-blue-600", bg: "bg-blue-100" },
  { name: "ELK Stack", type: "Logging", desc: "Centralized logs (Filebeat -> Logstash -> ES)", color: "text-green-600", bg: "bg-green-100" },
  { name: "Jaeger", type: "Tracing", desc: "Distributed tracing for microservices", color: "text-cyan-600", bg: "bg-cyan-100" },
  { name: "PagerDuty", type: "Alerting", desc: "Critical alerts (5xx > 1%, Payment Failures)", color: "text-red-600", bg: "bg-red-100" }
];
