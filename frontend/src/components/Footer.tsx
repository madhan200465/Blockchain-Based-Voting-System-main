import React from "react";

const Footer = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer-inner">
        <div>
          <div className="footer-brand-row">
            <span className="brand-mark">
              <i className="bi bi-shield-check"></i>
            </span>
            <div className="footer-brand">SecureVote</div>
          </div>
          <div className="footer-copy text-normal">
            Transparent, tamper-resistant voting for modern election workflows.
          </div>
        </div>
        <div className="footer-meta text-normal">Copyright © 2025 Madhan. All rights reserved.</div>
      </div>
    </footer>
  );
};

export default Footer;
