export const getuserColor = (userId: string) => {
    const palette = ["#7c5cfc", "#38bdf8", "#34d399", "#f97316", "#f43f5e", "#a78bfa", "#67e8f9", "#6ee7b7", "#fb923c", "#f472b6", "#c084fc", "#22d3ee", "#86efac", "#fb7185"];
    let hash = 0;

    for(let i = 0; i < userId.length; i++) {
        hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
    }

    return palette[hash % palette.length];
}