import axios from 'axios';

export const checkSerpRanking = async (url: string, query?: string): Promise<boolean> => {
    // This is a placeholder. A real implementation would use the SerpApi key from .env
    return false;
};

export const isRankedOnGoogle = checkSerpRanking;
