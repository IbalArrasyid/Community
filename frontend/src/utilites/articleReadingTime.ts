export const estimateArticleReadingMinutes = (text: string | null | undefined): number => {
    const words = text?.match(/\S+/gu)?.length ?? 0;
    return words ? Math.ceil(words / 200) : 0;
};
