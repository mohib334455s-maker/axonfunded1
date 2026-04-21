/**
 * Official Axon trading rules — single source of truth for /rules and dashboard.
 * Numbering matches the published document (section 6 is not used in the original).
 */

export type AxonRulesSubsection = { title: string; paragraphs: string[] };

export type AxonRulesSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  subsections?: AxonRulesSubsection[];
};

export const AXON_RULES_SECTIONS: AxonRulesSection[] = [
  {
    id: "intro",
    title: "Introduction & Legal Reference",
    paragraphs: [
      "Please Review Your Success Roadmap Carefully!",
      "At Axon, transparency is our top priority. Our rules are structured to ensure a fair and professional environment for all trading talents.",
      "Final Authority: The written terms and conditions on this page constitute the sole official reference for all decisions. While our Live Support and AI bots are here to assist you, the written rules on the website will always prevail in case of any discrepancy.",
      "Trader Responsibility: By selecting a plan and completing your order, you agree to abide by all terms of this agreement. Advancing through evaluation phases to a Funded account is strictly contingent upon full compliance with these regulations.",
    ],
  },
  {
    id: "trading-days",
    title: "1. Trading Days & Time Limit",
    subsections: [
      {
        title: "Minimum Trading Days",
        paragraphs: [
          "To demonstrate consistency and avoid purely speculative trades, Axon requires a minimum of 5 distinct trading days in both Evaluation (Phase 1) and Verification (Phase 2). A 'Trading Day' is only counted when a position is opened. If a trade is opened on Monday and held until Friday, it will only count as 1 trading day.",
        ],
      },
      {
        title: "Maximum Time Limit & Account Inactivity",
        paragraphs: [
          "Traders at Axon enjoy an Evaluation process with No Time Limit; you can take all the time you need to reach your profit targets. However, to maintain the system's efficiency, accounts that remain inactive for a consecutive 30-day period will be automatically forfeited and permanently closed. This implies that at least one trade must be executed within every 30-day window.",
        ],
      },
    ],
  },
  {
    id: "drawdown",
    title: "2. Daily & Maximum Drawdown Rules",
    subsections: [
      {
        title: "A) Daily Drawdown Calculation",
        paragraphs: [
          "At Axon Funded, the daily drawdown is set at 5%, calculated based on the account balance at the start of the trading day (00:00 Broker Server Time). Neither the balance nor the equity is permitted to drop below this threshold.",
          "Logic: If you have open positions at the daily reset, the drawdown is still determined by the starting balance, not the floating equity.",
          "Example: If your starting balance is $100,000, your daily limit is $5,000. Your account equity must not fall below $95,000 at any point during that day.",
        ],
      },
      {
        title: "B) Maximum Overall Drawdown",
        paragraphs: [
          "The Maximum Drawdown is fixed at 12% of the initial account balance. This is a Static Drawdown, meaning the limit does not \"trail\" or move up as you make profits.",
          "Example: For a $50,000 account, the 12% limit is $6,000. This makes your absolute floor $44,000. If your equity or balance hits this level, the account will be closed.",
        ],
      },
    ],
  },
  {
    id: "days-after-target",
    title: "3. Completion of Trading Days After Reaching Target",
    subsections: [
      {
        title: "Meeting Trading Day Requirements After Target Completion",
        paragraphs: [
          "If you achieve your profit target before reaching the minimum requirement of 5 trading days, you are permitted to open positions with the minimum lot size to fulfill the remaining days.",
          "Policy: This is designed to allow traders to complete their duration requirements without unnecessary risk. You may reduce your position size to the lowest possible increment (e.g., 0.01 lot) until the mandatory trading days are recorded.",
        ],
      },
    ],
  },
  {
    id: "post-phase",
    title: "4. Post-Challenge Completion Process",
    subsections: [
      {
        title: "What should I do after successfully completing a challenge phase?",
        paragraphs: [
          "Congratulations on your achievement! Once you have reached the profit target and met all trading requirements, you are required to submit a \"Support Ticket\" through your member dashboard.",
          "Verification Process: Our risk management team will review your account to ensure compliance with all drawdown and trading rules. This review is typically completed within 24 to 48 business hours. Upon approval, your credentials for the next phase or the funded account will be issued.",
        ],
      },
    ],
  },
  {
    id: "violations",
    title: "5. Rule Violations & Financial Liability",
    subsections: [
      {
        title: "A) If a trade breaches the drawdown limit and then returns to profit, is it still a violation?",
        paragraphs: [
          "Yes. Axon utilizes an automated, real-time monitoring system. If your account equity or balance touches the 5% daily or 12% overall drawdown limit, the account is immediately breached and deactivated, regardless of subsequent market recovery.",
        ],
      },
      {
        title: "B) Am I liable for losses exceeding the drawdown in a Funded account?",
        paragraphs: [
          "No. Axon assumes all financial risks associated with trading on live accounts. Traders are never required to compensate the company for any losses incurred during their trading activities.",
        ],
      },
      {
        title: "C) What happens after a rule violation?",
        paragraphs: [
          "If a violation occurs, the current account will be closed, and the evaluation ends. However, this does not ban you from our platform; you are always welcome to start a new challenge and showcase your trading skills again.",
        ],
      },
    ],
  },
  {
    id: "weekend",
    title: "7. Position Holding & Weekend Trading",
    subsections: [
      {
        title: "A) Can I hold positions overnight and over the weekend?",
        paragraphs: [
          "Yes. Axon allows you to hold positions overnight and throughout the weekend without any restrictions.",
          "Notice: Please be aware of potential market gaps during Monday openings. Any breach of drawdown limits caused by weekend gaps is the trader's responsibility.",
        ],
      },
      {
        title: "B) Weekend Trading on Cryptocurrencies",
        paragraphs: [
          "Trading on Crypto assets is only permitted when the global market is active.",
          "Key Rule: Opening new positions, modifying orders, or triggering pending orders (SL, TP, etc.) while the global market is closed is strictly prohibited. Axon follows the official global market open/close times as reflected on the broker's platform.",
        ],
      },
    ],
  },
  {
    id: "news",
    title: "8. News Trading",
    subsections: [
      {
        title: "Is News Trading allowed?",
        paragraphs: [
          "Yes, Axon imposes no restrictions on trading during high-impact economic news. However, due to market volatility, widened spreads, and potential slippage, we strongly advise exercising strict risk management. The trader assumes full responsibility for any losses incurred due to extreme market conditions during news events.",
        ],
      },
    ],
  },
  {
    id: "kyc",
    title: "9. Identity Verification - KYC",
    subsections: [
      {
        title: "Identity Verification (KYC Process)",
        paragraphs: [
          "In compliance with international anti-money laundering (AML) regulations, all traders must complete the Identity Verification process after passing the challenge phases to receive a Funded account.",
          "Age Requirement: The trader must be at least 18 years old.",
          "Accepted Documents: A high-quality scan or photo of a valid National ID, Passport, or Driver's License.",
          "Selfie Requirements:",
          "Hold your ID document in your left hand at chest level.",
          "Wear dark clothing against a light/plain background.",
          "The photo must be clear, without glasses, and free of any digital filters.",
          "Both shoulders and your entire face must be visible within the frame.",
        ],
      },
    ],
  },
  {
    id: "refund",
    title: "10. Challenge Fee Refund Policy",
    subsections: [
      {
        title: "Fee Refund Policy",
        paragraphs: [
          "The initial registration fee paid for the challenge at Axon will be fully reimbursed to the trader once they successfully complete the evaluation phases and transition to a Funded account.",
          "Eligibility & Payout: After completing a minimum of 10 trading days on the Funded account, the trader can request their first profit withdrawal. The 100% registration fee refund will be automatically added to and paid out with this first profit withdrawal.",
          "Evaluation purchases (before funding): once any trade is opened on the purchased evaluation account, the registration fee is not refundable under discretionary policy except where mandatory consumer law applies. If no position has been opened within 14 calendar days of purchase, you may request cancellation and refund of the fee through Live Support.",
        ],
      },
    ],
  },
  {
    id: "payout",
    title: "11. Profit Withdrawal & Payout Rules",
    subsections: [
      {
        title: "A) Payout Cycle & Timing",
        paragraphs: [
          "Traders are eligible for their first payout after completing 10 active trading days on the Funded account. Following the first successful withdrawal, the account transitions to an \"On-Demand Daily Payout\" model. From this point, you can request a withdrawal whenever your profit reaches at least 1% of the initial balance.",
        ],
      },
      {
        title: "B) Withdrawal Conditions",
        paragraphs: [
          "All payout requests must be submitted via the Client Dashboard.",
          "The account must have no open positions when requesting a payout.",
          "No new trades should be executed until the payout process is complete; otherwise, the request will be canceled.",
          "Each payout covers the full profit amount available in the account; partial withdrawals are not permitted.",
        ],
      },
      {
        title: "C) Processing & Account Reset",
        paragraphs: [
          "Upon submitting a request, the current account credentials will be disabled for review. After technical approval, new account credentials will be issued to the trader. This entire process is completed within a maximum of 24 hours.",
        ],
      },
      {
        title: "D) Rule Violations",
        paragraphs: [
          "If a rule violation occurs on a Funded account (such as reaching Daily or Maximum Drawdown), any remaining profit in the account will be forfeited and will not be paid out.",
        ],
      },
    ],
  },
  {
    id: "retake",
    title: "12. Account Retake & Discount Policy",
    subsections: [
      {
        title: "Account Retake Policy",
        paragraphs: [
          "At Axon, we believe every setback is an opportunity to improve. If you lose your trading account due to a rule violation, you are eligible for a special retake discount to start over.",
          "20% Discount: Traders can purchase a new challenge with a 20% discount, provided the purchase is made within the first 24 hours after the account's deactivation.",
          "How to Activate: To claim your discount code, please contact our Live Support team within the specified 24-hour window.",
        ],
      },
    ],
  },
  {
    id: "allocation",
    title: "13. Maximum Allocation & Account Merging",
    subsections: [
      {
        title: "A) Maximum Capital Allocation",
        paragraphs: [
          "Each trader at Axon is permitted to manage a total combined capital of up to $600,000 across all evaluation or funded accounts.",
        ],
      },
      {
        title: "B) Account Merging Policy",
        paragraphs: [
          "Traders holding multiple Funded (Live) accounts are eligible to request an account merger.",
          "Requirement: Merging is exclusively available for funded accounts, provided the combined total does not exceed the $600,000 limit. To initiate a merger, please contact our support team via a ticket.",
        ],
      },
    ],
  },
  {
    id: "slippage",
    title: "14. Slippage & Technical Trading Policy",
    subsections: [
      {
        title: "A) Slippage & Spread Awareness",
        paragraphs: [
          "During high-impact news, market openings (Gaps), or low-liquidity periods (such as rollover hours), widened spreads and price slippage may occur. This is a standard characteristic of global financial markets.",
          "Trader Responsibility: Axon is not liable for stop-losses triggered due to slippage during extreme volatility. We advise traders to exercise caution and manage exposure during these periods.",
        ],
      },
      {
        title: "B) Prohibited Technical Strategies",
        paragraphs: [
          "Any attempt to exploit price latency (Latency Arbitrage), take advantage of server software bugs, or use harmful algorithmic strategies that disrupt market integrity is strictly prohibited. Axon reserves the right to void profits and deactivate accounts found in violation of these terms.",
        ],
      },
    ],
  },
  {
    id: "password",
    title: "15. Account Security & Password Policy",
    subsections: [
      {
        title: "Is the trader allowed to change the MetaTrader account password?",
        paragraphs: [
          "No. Traders are strictly prohibited from changing either the Master Password or the Investor Password of their trading accounts.",
          "Security Responsibility: Trading account credentials are sent directly to the user's registered email address. The trader is solely responsible for the security and confidentiality of these credentials. Any unauthorized password change will disconnect the account from Axon's monitoring system and will be treated as a rule violation.",
        ],
      },
    ],
  },
  {
    id: "copy",
    title: "16. Copy Trading & Global Talent Acquisition",
    subsections: [
      {
        title: "A) Full Freedom in Copy & Group Trading",
        paragraphs: [
          "At Axon, we impose no restrictions on your trading style. Our mission is to partner with profitable traders, regardless of the methods used. You are permitted to copy trades from your own external accounts, other traders, or any copy-trading systems. Team-based trading and executing identical trades across multiple accounts are also fully allowed.",
        ],
      },
      {
        title: "B) Copying from Reference Accounts (Mentors)",
        paragraphs: [
          "We welcome your success. Traders who wish to mirror the trades of professional mentors or verified master accounts face no restrictions. This is a strategic opportunity for those looking to pass their evaluations with higher confidence.",
        ],
      },
      {
        title: "C) Our Vision: Investing in Your Talent",
        paragraphs: [
          "Axon's primary goal goes beyond offering evaluation challenges; we aim to recruit elite traders. We recognize that many top-tier traders are already successfully managing their own live personal accounts. Our vision is a win-win partnership where Axon invests in disciplined traders. We possess the infrastructure to copy and execute the trades of our top-performing users directly onto the Company's Main Corporate Capital. Your profitability drives our mutual growth.",
        ],
      },
    ],
  },
  {
    id: "ea",
    title: "17. Expert Advisor & Trading Bot Policy",
    subsections: [
      {
        title: "Is the use of Expert Advisors (EAs) allowed at Axon?",
        paragraphs: [
          "Yes! Our mission is to discover and adopt profitable and consistent trading strategies, whether they are executed manually or via automated bots.",
          "Condition for EA Usage: Traders are welcome to use Expert Advisors. However, upon successfully passing the evaluation phases, the trader must provide the Source Code of the robot to Axon's technical team. This allows the company to execute those profitable strategies directly on the firm's primary corporate capital.",
          "Risk Management Tools: The use of any EA or trading assistant for risk management, lot size calculation, or position management is fully permitted and encouraged.",
        ],
      },
    ],
  },
  {
    id: "ib",
    title: "18. Strategic Partnership Program (IB) - Industry-Leading Rates",
    subsections: [
      {
        title: "Strategic Partnership Program (IB) - Industry-Leading Rates",
        paragraphs: [
          "Axon is building a powerful network of professional mentors and traders. By streamlining our operations, we offer the highest possible rewards to our strategic partners.",
          "20% Cash Commission: For every challenge purchase made through your unique referral link, you receive a 20% cash commission on the total transaction value.",
          "Instant Cash Payouts: Unlike other programs, your rewards at Axon are fully withdrawable in cash (or USDT). There are no restrictions on liquidating your earnings.",
          "Empowering Your Influence: We value the impact of your mentorship. Axon provides all the necessary tracking tools to monitor your referrals and optimize your conversion rates.",
        ],
      },
    ],
  },
];
