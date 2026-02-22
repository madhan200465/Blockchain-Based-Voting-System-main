# Literature Survey — Detailed (2024–2025)

This document expands the earlier short survey into a detailed literature review focused on methods, experiments, limitations, and concrete reuse pathways for the "Blockchain-Based Voting System" project. The goal is to map each relevant paper to practical engineering work you can do in this repo (`Election.sol`, `server.ts`, `web3.ts`, `src/controllers/auth/*`) and to explain why our hybrid approach improves on their core trade-offs.

Summary of scope: 2024–2025 papers that address privacy-preserving tallies (HE), succinct ballot validity (ZKPs), prover acceleration, delegation/privacy, and practical deployment patterns (commit-reveal, off-chain anchors, SSI).

---

## Paper-by-paper detailed summaries

1) if-ZKP — "Intel FPGA-Based Acceleration of Zero Knowledge Proofs" (Dec 2024)
- Core idea: accelerate the proving stage of ZKP pipelines using FPGA-specific optimizations and hardware pipelines to lower end-to-end proof latency.
- Methodology: implement prover kernels on FPGA for arithmetic/FFT-heavy parts of common ZK schemes, benchmark prover latency and throughput against CPU/GPU baselines.
- Reported strengths: substantial prover speedups on hardware for specific circuits; energy efficiency improvements for repeated proving workloads.
- Limitations noted: dependence on specialized hardware; integration complexity; single-prover throughput limits if prover is a bottleneck.
- Practical reuse for this project: the paper justifies using hardware-accelerated provers when processing large batches of votes; we can adopt the batching-friendly kernels and the idea of separating prover work from aggregation.
- Repo integration notes: add a `prover/` service orchestrated by `server.ts` that can use FPGA-accelerated nodes (if available) or fall back to GPU/CPU provers; ensure the prover API supports batched input and proof aggregation.
- How we improve: run a horizontally scalable prover pool + proof aggregation so per-vote amortized cost falls below single-FPGA baselines; design a software fallback to maintain availability.

2) "Overcoming Bottlenecks in Homomorphic Encryption for the 2024 Mexican Federal Election" (Apr 2025)
- Core idea: practical optimizations to homomorphic encryption (HE) workflows for large-scale election tallies, focusing on packing, precomputation, and network-efficient aggregation.
- Methodology: case study on large dataset, measure HE encoding/aggregation times and propose packing/batching techniques and parameter choices for practical performance.
- Strengths: shows HE can be practical with careful batching and parameter tuning; demonstrates trustee workflows for threshold decryption.
- Limitations: HE-only systems still incur high compute and network costs compared with hybrid approaches; HE does not easily provide per-ballot validity checks.
- Practical reuse: adopt HE packing and trustee threshold-decryption patterns for the arithmetic tally portion of our pipeline while avoiding full-HE reliance for ballot validity.
- Repo integration notes: implement client-side ciphertext generation helpers (frontend), server-side aggregation routines (`server.ts`), and trustee orchestration scripts (`server/trustees/*`).
- How we improve: use packed HE only for arithmetic aggregation and validate ballots with ZKPs to avoid costly HE-based validity proofs; combine HE aggregation with batched ZK proofs to get privacy + light verification.

3) Kite — "How to Delegate Voting Power Privately" (Jan 2025)
- Core idea: cryptographic delegation primitives that let users privately delegate voting power while preserving revocation and accountability.
- Methodology: proposes delegation receipts, ZK-backed delegation proofs, and revocation mechanisms; analyzes privacy guarantees and gas cost trade-offs.
- Strengths: clear model for delegation privacy and revocation; practical proof constructions.
- Limitations: gas cost of delegation verification on-chain; delegation graph publication can leak metadata if naively implemented.
- Practical reuse: implement private delegation semantics for token-weighted or delegated voting scenarios in our system, keeping delegation proofs off-chain or compact on-chain.
- Repo integration notes: add `web3.ts` delegation helpers, store compact delegation commitments on-chain (`Election.sol`), provide frontend revocation flows in `src/controllers/auth/*`.
- How we improve: encode delegations as Merkle commitments and verify delegation with aggregated ZK proofs to reduce on-chain cost and metadata exposure.

4) zkPHIRE / "Need for zkSpeed" family (2025)
- Core idea: circuit-level and system-level optimizations to accelerate zero-knowledge proof pipelines (specialized circuit encodings, hardware-aware optimizations, batching, and aggregation techniques).
- Methodology: propose circuit decomposition, specialized arithmetic encodings, and accelerator-friendly proof primitives; measure prover and verifier latency across different circuit granularities.
- Strengths: shows that small, modular circuits plus aggregation outperform monolithic constructs in prover and verifier cost.
- Limitations: requires redesigning the application logic to be ZK-friendly; aggregator complexity increases.
- Practical reuse: split ballot-validation logic into minimal circuits (eligibility, syntax, signature correctness) and batch-prove ballots; adopt aggregation-friendly constructions.
- Repo integration notes: add circuit sources under `prover/circuits/`, extend `server.ts` to compile circuits (circom/halo2), and create an aggregated-verifier contract in `Election.sol`.
- How we improve: combine modular circuits with prover-pool + aggregation to reduce per-vote prover time beyond published single-node results; measure and tune batch sizes.

5) VoteMate — "Decentralized Application for Scalable Electronic Voting on EVM-Based Blockchain" (May 2025)
- Core idea: engineering patterns to make per-vote EVM costs manageable: commit-reveal flows, on-chain anchors for off-chain vote storage, and gas-optimized contract layouts.
- Methodology: prototype an EVM-based DApp, profile gas costs, and show patterns to reduce on-chain storage and per-vote writes.
- Strengths: practical, EVM-centric guidance for making e-voting feasible on public chains.
- Limitations: still pays non-negligible gas per vote when votes are anchored individually; does not incorporate aggregated ZK verification or HE tallies.
- Practical reuse: adopt commit-reveal + off-chain storage and Merkle anchoring; use VoteMate gas-optimization patterns for `Election.sol` storage layout.
- Repo integration notes: modify `web3.ts` to create batched bundles, store vote bundles on IPFS and anchor merkle roots on-chain, and implement an orchestration flow in `server.ts`.
- How we improve: replace per-vote anchoring with batched rollups plus aggregated ZK verification to minimize gas further while preserving verifiability.

6) Springer survey — "Blockchain for securing electronic voting systems: a survey of architectures, trends, solutions, and challenges" (2024)
- Core idea: comprehensive taxonomy of architectures, threat models, and evaluation metrics for blockchain e-voting systems.
- Methodology: systematic literature review covering architecture types, privacy techniques, verifiability models, and suggested evaluation criteria.
- Strengths: concise threat matrix and recommended benchmark criteria; helps identify evaluation gaps.
- Limitations: limited experimental data; mostly a synthesis of prior work rather than novel empirical results.
- Practical reuse: use the threat matrix and the recommended evaluation criteria to build reproducible benchmark scenarios for our hybrid design.
- Repo integration notes: add `benchmarks/` to capture the survey's test cases and adopt their metrics in our measurement scripts.
- How we improve: provide the missing empirical evaluations by publishing reproducible benchmark scripts and results for our architecture.

7) Practical IEEE prototype — "A Comprehensive Secured Digital Voting System using Web Development and Blockchain" (IEEE, 2025)
- Core idea: prototype-level integration of blockchain and web UI with biometric onboarding examples to demonstrate feasibility in smaller deployments.
- Methodology: implement a full-stack prototype, report usability insights and integration lessons.
- Strengths: practical UX lessons and real-world integration notes for onboarding voters.
- Limitations: centralized biometric storage in the prototype creates privacy risk; prototype scale limits applicability to national elections.
- Practical reuse: borrow UX flow patterns and onboarding steps but replace biometric storage with SSI and selective disclosure.
- Repo integration notes: update `src/controllers/auth/*` to support SSI flows and generate ZK attestations rather than storing raw biometric data.
- How we improve: remove centralized biometric storage, replace with privacy-preserving SSI attestations and ZK selective-disclosure proofs.

---

## Cross-paper comparison (short)

- Privacy methods: HE (full ciphertext-based tallies) vs ZK (per-ballot validity) vs hybrid (packed HE for arithmetic + ZK for validity). Hybrid balances compute and verification costs.
- Scalability: per-vote on-chain anchoring (VoteMate) vs batched anchoring + L2-style rollups (our approach). Batching + aggregation yields better gas amortization.
- Prover cost: single-node FPGA acceleration (if-ZKP) vs prover pool + aggregation (our approach). Pool + aggregation reduces latency variability and improves availability.
- Identity: biometric-centralized (IEEE prototype) vs SSI + selective disclosure (our approach) — SSI reduces privacy risk and central points of failure.

---

## Practical recommendations for reuse & implementation

1. Start with a small batched ZK prototype: implement a minimal circuit (eligibility + vote-format) in `prover/circuits/`, a CPU/GPU prover in `prover/`, and a simple aggregated verifier in `Election.sol`.
2. Add HE-packed tallying as an experimental branch; use small test polls to tune parameters and measure CPU/network cost vs HE-only baselines.
3. Implement delegation as Merkle-committed receipts with ZK-backed revocation to keep delegation private and gas-efficient.
4. Build benchmarks that follow the Springer survey's threat matrix and publish results in `benchmarks/`.
5. If hardware is available, add an FPGA-enabled prover node interface to the prover pool; otherwise use GPU-optimized proving and micro-batching to approximate the benefits.

---

## Short bibliography (selected)
1. Shahzad Ahmad Butt et al., "if-ZKP: Intel FPGA-Based Acceleration of Zero Knowledge Proofs", arXiv:2412.12481 (Dec 2024).
2. Eric Landquist et al., "Overcoming Bottlenecks in Homomorphic Encryption for the 2024 Mexican Federal Election", arXiv:2504.13198 (Apr 2025).
3. Kamilla Nazirkhanova et al., "Kite: How to Delegate Voting Power Privately", arXiv:2501.05626 (Jan 2025).
4. Alhad Daftardar et al., "zkPHIRE: A Programmable Accelerator for ZKPs", arXiv:2508.16738 (2025).
5. Ivan Homoliak & Tomáš Švondr, "VoteMate: A Decentralized Application for Scalable Electronic Voting on EVM-Based Blockchain", arXiv:2505.15797 (May 2025).
6. HO Ohize et al., "Blockchain for securing electronic voting systems: a survey of architectures, trends, solutions, and challenges", Springer (2024).
7. V. Sowmitha et al., "A Comprehensive Secured Digital Voting System using Web Development and Blockchain", IEEE (2025).

---

If you'd like, I can (A) convert this expanded review into a 2–3 page PDF/Markdown formatted for a thesis with inline citations, or (B) extract the short-actionable engineering checklist to begin implementation (batched ZK prototype). Reply with A or B.

