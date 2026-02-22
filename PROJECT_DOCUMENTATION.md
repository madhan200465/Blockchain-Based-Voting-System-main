# Project Documentation — Blockchain-Based Voting System

This document provides a full-scope description of the project: Abstract, Introduction, Literature Survey pointers, Existing System, Advantages & Disadvantages, Proposed System, Requirements (H/W & S/W), Module List, Architecture, Conclusion, and References.

---

## Abstract

This project implements a secure, privacy-preserving, and scalable blockchain-based voting system that combines smart-contract anchoring, off-chain privacy-preserving tallying, and succinct verification via zero-knowledge proofs (ZKPs). The design improves gas-efficiency and prover latency by batching votes, aggregating ZK proofs, and using a hybrid privacy stack (packed Homomorphic Encryption for tally arithmetic + ZK for ballot validity). Identity and onboarding rely on Self-Sovereign Identity (SSI) with selective disclosure, avoiding centralized biometric stores. The system targets real-world election properties: voter privacy, end-to-end verifiability, integrity, scalability, and practical deployment cost reductions compared to recent published approaches.

---

## Introduction

E-voting promises accessibility and auditability but faces three core challenges: preserving voter privacy, ensuring end-to-end verifiability, and achieving practical scalability and cost on public blockchains. This project demonstrates a hybrid architecture that minimizes on-chain state and gas while providing cryptographic guarantees for ballot validity and private tallying. The implementation is split across smart contracts (`Election.sol`), a backend prover and aggregator (`server.ts`), web3 helpers (`web3.ts`), and frontend controllers for identity and vote submission.

Goals:
- Preserve ballot secrecy while enabling public verifiability of tallies.
- Minimize on-chain gas per vote using batching and aggregated verification.
- Provide reproducible benchmarks comparing HE, ZK, and L2 aggregation trade-offs.

---

## Literature Survey (summary)

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

## Existing System (in this repository)

Files and components (current state):
- `contracts/Election.sol` (contract located in `backend/contracts` or `backend/build/contracts`): smart contract for poll lifecycle, votes storage / result publishing.
- `src/server.ts` (backend): Node/TypeScript server for API, integration with web3, possibly current vote submission and DB storage.
- `src/web3.ts`: client-side helper functions to interact with smart contract and build transactions.
- `src/controllers/` and `frontend/`: existing controllers and UI for auth, polls, and voting flows.

Current behavior: simple on-chain commit-reveal or per-vote transactions (depends on current code), DB-backed user management, and basic web3 integration.

---

## Advantages and Disadvantages of Existing System

Advantages:
- End-to-end flow exists (frontend ↔ backend ↔ smart contract).  
- Clear project structure with TypeScript backend and React frontend.  
- Basic smart contract and migrations are already present (`build/contracts/Election.json`).

Disadvantages / Limitations:
- Per-vote gas costs if votes are recorded on-chain individually (not batched).  
- If using simple on-chain storage, ballot privacy may be weak unless additional cryptographic layers exist.  
- No integrated ZK/HE prover pipeline; heavy cryptographic operations are not implemented.
- Potential centralized identity storage in prior prototypes (biometrics) causing privacy risk.

---

## Proposed System (detailed)

High-level design:
1. Client prepares a ballot and computes a ballot commitment and a ZK witness proving ballot-format correctness and voter eligibility (without revealing vote).  
2. The client (or server) sends vote commitments and witness data to the prover service. Votes are collected into batches (size tunable).  
3. The prover pipeline (in `server.ts` or a separate `prover/` service) generates individual proofs and aggregates them into a single succinct proof, or directly creates a batched aggregated proof for N ballots.  
4. The backend stores full encrypted vote bundles off-chain (IPFS/Swarm) and anchors only Merkle roots and the aggregated proof on-chain via `Election.sol`.  
5. Tallying is performed by an off-chain HE aggregation (packed ciphertexts) and threshold decryption among trustees; only the final decrypted tally is committed on-chain.  
6. Identity: onboarding uses SSI attestations and selective disclosure; voter eligibility uses ZK attestations derived from SSI credentials (no raw biometrics stored).

Security & privacy primitives:
- ZKPs for ballot validity & delegation proofs.  
- Homomorphic encryption (packed) for tally arithmetic and efficient aggregation.  
- Threshold decryption by a trusted trustee set to avoid single point decryption.  
- Merkle anchoring to ensure auditability with off-chain storage.

Improvements over baseline papers:
- Aggregated ZK verification reduces per-vote gas significantly over per-vote verification.  
- Hybrid HE+ZK reduces HE compute overhead compared to full-HE proposals while preserving tally privacy.  
- SSI + ZK identity flow removes centralized sensitive data storage.

---

## Advantages of Proposed System

- Significantly lower gas per vote due to batching and aggregated verification.  
- Maintains ballot secrecy via HE for tally and ZK for validity.  
- Practical prover latency using prover pools and hardware acceleration where available.  
- Reproducible benchmarking and modular design for swapping HE/ZK components.

---

## Requirements

Hardware (recommended):
- Development: modern laptop (4+ cores, 16GB RAM).  
- Prover nodes (for production/testing large batches): 8+ core CPU or GPU-enabled nodes; optional FPGA accelerator for ZK proving if available.  
- Trustee machines: 3+ independent servers (for threshold decryption/multi-party coordination).
- Storage: IPFS node or pinning service; at least 100GB for test deployments if storing vote bundles.

Software:
- Node.js >= 18, Yarn or npm.  
- TypeScript (already present in repo).  
- Truffle or Hardhat (project uses Truffle config).  
- Solidity compiler >= the version used by `Election.sol` (check `truffle-config.js`).  
- ZK toolchain: circom/snarkjs or Halo2/Plonk toolset depending on chosen scheme.  
- Homomorphic encryption library: Microsoft SEAL, PALISADE, or PySEAL wrapper (for packed HE).  
- IPFS daemon / pinning service or S3-compatible storage for vote bundles.  
- Docker (recommended) for reproducible prover and trustee deployments.

---

## Module List

1. Frontend (React) — voting UI, SSI prompts, commitment generation.  
2. Web3 Helpers (`src/web3.ts`) — transaction building, batch submission.  
3. Backend API (`src/server.ts`) — batch builder, IPFS integration, aggregator controller, trustee coordinator.  
4. Prover Service (`prover/` or inside `server.ts`) — circuit compilation, individual proofs, aggregation, prover pool.  
5. Smart Contracts (`contracts/` + `Election.sol`) — anchor Merkle roots, accept aggregated proofs, publish final tally.  
6. Trustee Tools (`server/trustees/*`) — threshold keygen, threshold decryption orchestration.  
7. Storage Layer — IPFS/Pinning + on-chain root anchoring.  
8. Benchmarks & Tests (`benchmarks/`) — reproducible scripts for gas, latency, prover cost.

---

## Architecture

Core dataflows:
- Vote submission: Frontend -> web3 helper -> backend batch collector -> IPFS storage + merkle build -> prover -> aggregated proof -> on-chain anchor via `Election.sol`.
- Tallying: backend aggregates HE ciphertexts -> trustees perform threshold decryption -> final tally anchored on-chain.

Component interactions (high level):
- Frontend calls `src/web3.ts` to produce a vote bundle and commit.  
- `server.ts` collects bundles for a poll, builds Merkle tree, stores full bundles on IPFS, sends leaves to prover queue.  
- Prover nodes generate per-leaf proofs and an aggregated proof.  
- Aggregated proof and merkle root are sent to `Election.sol` by an orchestrator account.  
- Trustees run threshold decryption using `server/trustees/*` scripts when poll closes; final tally recorded on-chain.

Suggested on-chain interface (simplified):
- `anchorBatch(bytes32 merkleRoot, bytes aggregatedProof, uint256 batchId)` — anchor batch roots and proofs.  
- `publishTally(uint256 pollId, int[] results, bytes proofOfDecryption)` — publish final tally with proof of correctness.

Architecture diagram (ASCII):

Frontend ---> Backend API ---> IPFS
   |             |               |
   |             v               v
   |         Prover Pool ---> Aggregated Proof ---> Smart Contract (`Election.sol`)
   |                                         ^
   v                                         |
 SSI / Identity ---------------------------->

---

## Conclusion

This project aims to bridge the gap between cryptographic research and practical e-voting deployments by combining recent advances (ZK acceleration, HE batching, SSI) into a cohesive, modular architecture. The system prioritizes privacy, verifiability, and cost-efficiency. Next steps are prototyping the batched ZK flow and publishing reproducible benchmarks that compare our hybrid approach to the baseline approaches described in recent literature.

---

## References (selected, 2024–2025)

1. Shahzad Ahmad Butt et al., "if-ZKP: Intel FPGA-Based Acceleration of Zero Knowledge Proofs", arXiv:2412.12481 (Dec 2024).  
2. Eric Landquist et al., "Overcoming Bottlenecks in Homomorphic Encryption for the 2024 Mexican Federal Election", arXiv:2504.13198 (Apr 2025).  
3. Kamilla Nazirkhanova et al., "Kite: How to Delegate Voting Power Privately", arXiv:2501.05626 (Jan 2025).  
4. Alhad Daftardar et al., "zkPHIRE: A Programmable Accelerator for ZKPs", arXiv:2508.16738 (2025).  
5. Ivan Homoliak & Tom      , "VoteMate: A Decentralized Application for Scalable Electronic Voting on EVM-Based Blockchain", arXiv:2505.15797 (May 2025).  
6. HO Ohize et al., "Blockchain for securing electronic voting systems: a survey...", Springer (2024).  
7. V. Sowmitha et al., "A Comprehensive Secured Digital Voting System using Web Development and Blockchain", IEEE (2025).

---

If you want changes to wording, expansion of any section into a ready-to-submit thesis paragraph, or to start implementation (batched ZK prototype), reply with which section to expand or say "Start implementation".
