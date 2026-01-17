import { createCampaign, createPost, updatePostStatus } from './firebase.js';

/**
 * Seeds the database with demo campaign and posts
 * Creates 'Summer Launch 2026' campaign with 3 sample posts
 */
export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Create the campaign
    const campaignId = await createCampaign(
      'Summer Launch 2026',
      'Marketing campaign for summer product launch',
      '2026-06-01'
    );
    console.log(`Created campaign: ${campaignId}`);

    // Create Post 1 - Instagram (DRAFT)
    const post1Id = await createPost(
      campaignId,
      'Summer Product Teaser',
      'Instagram',
      'marketing@ps007.com'
    );
    console.log(`Created Instagram post (DRAFT): ${post1Id}`);

    // Create Post 2 - Twitter (IN_REVIEW)
    const post2Id = await createPost(
      campaignId,
      'Launch Announcement',
      'Twitter',
      'social@ps007.com'
    );
    // Update status to IN_REVIEW
    await updatePostStatus(post2Id, 'IN_REVIEW');
    console.log(`Created Twitter post (IN_REVIEW): ${post2Id}`);

    // Create Post 3 - LinkedIn (SCHEDULED)
    const post3Id = await createPost(
      campaignId,
      'Professional Launch Update',
      'LinkedIn',
      'pr@ps007.com'
    );
    // Update status to SCHEDULED
    await updatePostStatus(post3Id, 'SCHEDULED');
    console.log(`Created LinkedIn post (SCHEDULED): ${post3Id}`);

    console.log('Seeding Done');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Uncomment the line below to run the seeding function directly
seedDatabase();
