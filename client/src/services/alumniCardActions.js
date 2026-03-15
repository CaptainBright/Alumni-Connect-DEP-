/**
 * Placeholder actions for Alumni Cards.
 * Extend these later with actual backend endpoints or Supabase interactions.
 */

export const handleConnect = async (alumniId) => {
    console.log(`Connection request sent to: ${alumniId}`);
    // TODO: Add logic to insert connection request into Supabase or custom API
    // Example: await connectionService.sendRequest(currentUserId, alumniId);
    return { success: true, message: 'Connection request sent' };
};

export const handleMessage = (nav, alumniId) => {
    console.log(`Navigating to messaging route for alumni: ${alumniId}`);
    // Navigate to placeholder messaging route passing the target alumni ID if needed
    nav(`/messages?to=${alumniId}`);
};
