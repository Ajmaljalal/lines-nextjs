export const getEmailStats = async (messageId: string) => {
  try {
    const response = await fetch(`/api/get-email-stats?messageId=${messageId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.details || 'Failed to fetch email stats');
    }

    return data.data;
  } catch (error) {
    console.error('Failed to fetch email stats:', error);
    throw error;
  }
}
