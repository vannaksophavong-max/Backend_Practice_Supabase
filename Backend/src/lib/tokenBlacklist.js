const blacklist = new Map();

export const tokenBlacklist = {
    add(jti, expSeconds) {
        if (!jti || !expSeconds) return;
        blacklist.set(jti, Number(expSeconds) * 1000);
    },
    has(jti) {
        const exp = blacklist.get(jti);
        if (!exp) return false;
        if (Date.now() > exp) {
            blacklist.delete(jti);
            return false;
        }
        return true;
    },
    purgeExpired() {
        const now = Date.now();
        for (const [jti, exp] of blacklist) {
            if (now > exp) blacklist.delete(jti);
        }
    },
};
