import React from "react";
import Feature from "../Features/Feature";
import { MdGppGood, MdLibraryAddCheck, MdLock, MdShare } from "react-icons/md";

const Features = () => {
  return (
    <div className="features-wrapper" id="features">
      <div className="section-eyebrow">Platform capabilities</div>
      <div className="title-large">Secured by Blockchain</div>
      <div className="title-small">
        Ensuring transparency, integrity, and trust through decentralized technology.
      </div>

      <div className="mobile-wrapper">
        <div>
          <Feature title="Immutability" icon={<MdLock />} align="right">
            <p>
              Once a vote is cast, it is cryptographically signed and recorded on the
              blockchain. This creates a permanent, unalterable record that prevents
              any post-election tampering or administrative fraud.
            </p>
          </Feature>
        </div>

        <div className="mobile-container">
          <img src="/mobile.png" alt="security-shield" />
        </div>

        <div>
          <Feature title="Enhanced Security" icon={<MdGppGood />} align="left">
            <p>
              Leveraging advanced cryptography and multi-node consensus, our platform
              protects against unauthorized access and coordinated attacks, ensuring
              that every ballot originates from a verified citizen.
            </p>
          </Feature>
        </div>
        <div>
          <Feature title="Decentralized Control" icon={<MdShare />} align="right">
            <p>
              No central authority or single server controls the election results.
              The distributed nature of the network makes it nearly impossible for
              any single entity to manipulate the outcome or shut down the system.
            </p>
          </Feature>
        </div>
        <div>
          <Feature
            title="Distributed Ledger"
            icon={<MdLibraryAddCheck />}
            align="left"
          >
            <p>
              Results are distributed across multiple independent nodes in real-time.
              This transparency allows for public auditing while maintaining
              voter anonymity and privacy.
            </p>
          </Feature>
        </div>
      </div>
    </div>
  );
};

export default Features;
