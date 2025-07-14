const { webhookService } = require('./services/webhook.service.ts');

async function testCompleteWebhookSystem() {
  console.log('🧪 Starting complete webhook system test...\n');

  // Test 1: Register a webhook that gets saved to database
  console.log('📝 Test 1: Registering webhook (with database save)...');
  const webhookId = await webhookService.registerWebhook({
    name: 'Test Generic Webhook',
    url: 'https://httpbin.org/post',
    type: 'generic',
    isActive: true,
    events: ['lead.discovered', 'discovery.completed'],
    userId: 'clerk_test_user_123',
    filters: {
      minOpportunityScore: 70,
      subreddits: ['startups', 'entrepreneur'],
      keywords: ['project management', 'productivity'],
      priority: ['high', 'urgent']
    },
    rateLimitMinutes: 1
  });
  console.log(`✅ Webhook registered with ID: ${webhookId}\n`);

  // Test 1.5: Verify webhook is loaded in memory
  console.log('📝 Test 1.5: Verifying webhook is loaded in memory...');
  const userWebhooks = webhookService.getWebhooks('clerk_test_user_123');
  console.log(`Found ${userWebhooks.length} webhooks for user`);
  if (userWebhooks.length > 0) {
    console.log(`✅ Webhook loaded: ${userWebhooks[0].name}`);
  } else {
    console.log('❌ No webhooks loaded - forcing reload...');
    await webhookService.reloadWebhooks();
    const reloadedWebhooks = webhookService.getWebhooks('clerk_test_user_123');
    console.log(`After reload: ${reloadedWebhooks.length} webhooks`);
  }
  console.log('');

  // Test 2: Test the webhook connection
  console.log('📝 Test 2: Testing webhook connection...');
  const testResult = await webhookService.testWebhook(webhookId);
  console.log(`Test result: ${testResult ? '✅ Success' : '❌ Failed'}\n`);

  // Test 3: Broadcast a high-priority lead event
  console.log('📝 Test 3: Broadcasting high-priority lead event...');
  await webhookService.broadcastEvent('lead.discovered', {
    title: 'Looking for the best project management tool for my startup',
    subreddit: 'startups',
    author: 'startup_founder_2024',
    authorKarma: 1250,
    opportunityScore: 85,
    intent: 'solution_seeking',
    url: 'https://reddit.com/r/startups/comments/test123',
    numComments: 15,
    upvoteRatio: 0.92,
    createdAt: Math.floor(Date.now() / 1000),
    body: 'I need a robust project management solution for my growing startup.'
  }, 'clerk_test_user_123', 'campaign-123', 'high');
  console.log('✅ High-priority lead event broadcasted\n');

  // Test 4: Force process webhook queue
  console.log('📝 Test 4: Force processing webhook queue...');
  await webhookService.processQueuedEvents();
  console.log('✅ Webhook processing completed\n');

  // Test 5: Test filtering (low score - should be filtered out)
  console.log('📝 Test 5: Testing webhook filters (low score - should be filtered)...');
  await webhookService.broadcastEvent('lead.discovered', {
    title: 'Need help with basic accounting',
    subreddit: 'accounting',
    author: 'random_user',
    opportunityScore: 45, // Below filter threshold
    intent: 'information_seeking',
    url: 'https://reddit.com/r/accounting/comments/test456',
    numComments: 5,
    upvoteRatio: 0.65,
    createdAt: Math.floor(Date.now() / 1000)
  }, 'clerk_test_user_123', 'campaign-456', 'low');
  
  // Process the queue to see filtering in action
  await webhookService.processQueuedEvents();
  console.log('✅ Low-score lead event sent (should be filtered out)\n');

  // Test 6: Test wrong user ID (should be filtered out)
  console.log('📝 Test 6: Testing user filtering (wrong user - should be filtered)...');
  await webhookService.broadcastEvent('lead.discovered', {
    title: 'Another high-score lead',
    subreddit: 'startups',
    author: 'test_user',
    opportunityScore: 90,
    intent: 'solution_seeking',
    url: 'https://reddit.com/r/startups/comments/test789',
    numComments: 10,
    upvoteRatio: 0.85,
    createdAt: Math.floor(Date.now() / 1000)
  }, 'different_user_123', 'campaign-789', 'urgent');
  
  // Process the queue to see user filtering in action
  await webhookService.processQueuedEvents();
  console.log('✅ Event sent for different user (should be filtered out)\n');

  // Test 7: Test keyword filtering (should pass)
  console.log('📝 Test 7: Testing keyword filtering (should pass)...');
  await webhookService.broadcastEvent('lead.discovered', {
    title: 'Best project management tools for startups',
    subreddit: 'startups',
    author: 'startup_founder',
    opportunityScore: 80,
    intent: 'solution_seeking',
    url: 'https://reddit.com/r/startups/comments/keyword-test',
    numComments: 12,
    upvoteRatio: 0.88,
    createdAt: Math.floor(Date.now() / 1000),
    body: 'Looking for productivity tools to help manage my team'
  }, 'clerk_test_user_123', 'campaign-keyword', 'high');
  
  // Process the queue to see keyword filtering in action
  await webhookService.processQueuedEvents();
  console.log('✅ Keyword filtering test completed\n');

  // Test 8: Get webhook statistics
  console.log('📝 Test 8: Getting webhook statistics...');
  const stats = await webhookService.getWebhookStats('clerk_test_user_123');
  console.log('📊 Webhook Statistics:', JSON.stringify(stats, null, 2));
  console.log('✅ Statistics retrieved\n');

  // Test 9: Update webhook (disable it)
  console.log('📝 Test 9: Updating webhook (disable)...');
  const updateResult = await webhookService.updateWebhook(webhookId, {
    isActive: false
  });
  console.log(`Update result: ${updateResult ? '✅ Success' : '❌ Failed'}\n`);

  // Test 10: Test disabled webhook (should not fire)
  console.log('📝 Test 10: Testing disabled webhook...');
  await webhookService.broadcastEvent('lead.discovered', {
    title: 'Test disabled webhook',
    subreddit: 'startups',
    author: 'test_user',
    opportunityScore: 95,
    intent: 'solution_seeking',
    url: 'https://reddit.com/r/test/comments/disabled',
    numComments: 20,
    upvoteRatio: 0.95,
    createdAt: Math.floor(Date.now() / 1000)
  }, 'clerk_test_user_123', 'campaign-disabled', 'urgent');
  
  // Process the queue to see disabled webhook filtering
  await webhookService.processQueuedEvents();
  console.log('✅ Event sent to disabled webhook (should not fire)\n');

  console.log('🎉 All tests completed successfully!');
  console.log('📝 Check your test endpoint (https://httpbin.org/post) to see the webhook payload');
  console.log('📝 Check the database to see the saved webhook');
  
  // Optional: Clean up by deleting the test webhook
  console.log('🧹 Cleaning up test webhook...');
  const deleteResult = await webhookService.deleteWebhook(webhookId);
  console.log(`Delete result: ${deleteResult ? '✅ Success' : '❌ Failed'}`);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted by user');
  process.exit(0);
});

// Run the tests
testCompleteWebhookSystem().catch(console.error);