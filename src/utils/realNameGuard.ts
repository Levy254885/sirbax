/**
 * Private real-name vs public nickname guard.
 *
 * Real names are used ONLY in-memory for validation.
 * Never write them to Firestore public profiles or localStorage profile objects.
 */

export type NicknameCheckResult =
  | { allowed: true }
  | { allowed: false; reason: string };

/** Lowercase, strip accents, punctuation; collapse whitespace */
export function normalizePersonName(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Letters-only compact form (no spaces/digits/underscore) for containment checks */
function compactLetters(input: string): string {
  return normalizePersonName(input).replace(/[^a-z]/g, "");
}

/** Significant name tokens (length >= 3) */
function nameTokens(input: string): string[] {
  return normalizePersonName(input)
    .split(" ")
    .map((t) => t.replace(/[^a-z]/g, ""))
    .filter((t) => t.length >= 3);
}

/** Strip trailing _123 style suffixes from nicknames for comparison */
function nicknameCore(nickname: string): string {
  return nickname
    .replace(/[_\-.]?\d{2,5}$/g, "")
    .replace(/[_]+/g, " ");
}

/**
 * Returns whether `nickname` is safe to use publicly given the user's real/legal name.
 * Real name must never be persisted from this function.
 */
export function nicknameRevealsRealName(
  nickname: string,
  realName: string
): NicknameCheckResult {
  const nick = (nickname || "").trim();
  const real = (realName || "").trim();

  if (!real || real.length < 2) {
    return {
      allowed: false,
      reason:
        "Enter your real/legal name privately so we can verify your nickname stays anonymous. Your real name is never shown publicly.",
    };
  }

  if (!nick || nick.length < 3) {
    return {
      allowed: false,
      reason: "Nickname must be at least 3 characters.",
    };
  }

  const realCompact = compactLetters(real);
  const nickCompact = compactLetters(nicknameCore(nick));

  if (realCompact.length < 2) {
    return {
      allowed: false,
      reason: "Please enter a valid real name for private verification.",
    };
  }

  if (nickCompact === realCompact) {
    return {
      allowed: false,
      reason:
        "That nickname matches your real name. Choose a different anonymous name that does not reveal who you are.",
    };
  }

  if (
    realCompact.length >= 4 &&
    (nickCompact.includes(realCompact) || realCompact.includes(nickCompact))
  ) {
    return {
      allowed: false,
      reason:
        "Your nickname is too similar to your real name. Pick an anonymous nickname that does not include your real name.",
    };
  }

  const tokens = nameTokens(real);
  for (const token of tokens) {
    if (token.length >= 3 && nickCompact.includes(token)) {
      return {
        allowed: false,
        reason: `Your nickname includes part of your real name ("${token}"). Choose another anonymous nickname that does not reveal your identity.`,
      };
    }
  }

  if (tokens.length >= 2) {
    const jammed = tokens.join("");
    if (jammed.length >= 5 && nickCompact.includes(jammed)) {
      return {
        allowed: false,
        reason:
          "Your nickname combines your real name parts. Please choose a fully anonymous nickname.",
      };
    }
    const jammedRev = [...tokens].reverse().join("");
    if (jammedRev.length >= 5 && nickCompact.includes(jammedRev)) {
      return {
        allowed: false,
        reason:
          "Your nickname is derived from your real name. Please choose a different anonymous nickname.",
      };
    }
  }

  return { allowed: true };
}

/** Convenience: throws Error with user-facing message if not allowed */
export function assertAnonymousNickname(nickname: string, realName: string): void {
  const result = nicknameRevealsRealName(nickname, realName);
  if (!result.allowed) {
    throw new Error(result.reason);
  }
}
