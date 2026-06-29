/**
 * email-templates/index.js — Event registry for the email dispatcher.
 *
 * HOW TO ADD A NEW EMAIL EVENT:
 *   1. Create a new file in this directory (e.g., new-post.js)
 *   2. Export a function matching the signature: ({ lang, payload }) => { subject, html }
 *   3. Register it below with a dot-namespaced event key (e.g., 'post.published')
 *   4. Call sendEmail({ event: 'post.published', to, lang, payload }) from any function.
 *      That's it — the dispatcher handles the rest.
 *
 * Event naming convention:  domain.action
 *   newsletter.welcome        — subscriber just signed up
 *   newsletter.broadcast      — admin sends a newsletter issue
 *   contact.sender_receipt    — receipt to the contact form submitter
 *   contact.admin_notify      — alert to the Afrinia team inbox
 *   (future) post.published   — new article notification to subscribers
 *   (future) comment.reply    — someone replied to a user's comment
 *   (future) account.welcome  — new user account created
 */

import { welcome } from './welcome.js';
import { newsletter } from './newsletter.js';
import { contactSenderReceipt, contactAdminNotify } from './contact-confirm.js';

export const templates = {
  'newsletter.welcome':     welcome,
  'newsletter.broadcast':   newsletter,
  'contact.sender_receipt': contactSenderReceipt,
  'contact.admin_notify':   contactAdminNotify,

  // ── Future events (register here when the template file is created) ────────
  // 'post.published':      postPublished,
  // 'comment.reply':       commentReply,
  // 'account.welcome':     accountWelcome,
};
