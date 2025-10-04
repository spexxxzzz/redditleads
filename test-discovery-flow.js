const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDiscoveryFlow() {
  try {
    console.log('🧪 Testing Discovery Flow...');
    
    const userId = 'user_33Xjzg8eYYWpoPXOMQcvKhbw33b';
    
    // Get the most recent project
    const project = await prisma.project.findFirst({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        discoveryStatus: true,
        discoveryProgress: true,
        discoveryStartedAt: true,
        lastManualDiscoveryAt: true,
        _count: {
          select: {
            leads: true
          }
        }
      }
    });
    
    if (!project) {
      console.log('❌ No project found for testing');
      return;
    }
    
    console.log('\n📋 Current Project State:');
    console.log(`  ID: ${project.id}`);
    console.log(`  Name: ${project.name}`);
    console.log(`  Discovery Status: ${project.discoveryStatus || 'null'}`);
    console.log(`  Discovery Progress: ${JSON.stringify(project.discoveryProgress, null, 2)}`);
    console.log(`  Discovery Started At: ${project.discoveryStartedAt || 'null'}`);
    console.log(`  Last Manual Discovery: ${project.lastManualDiscoveryAt || 'null'}`);
    console.log(`  Leads Count: ${project._count.leads}`);
    
    // Test 1: Check if project can start new discovery
    console.log('\n🧪 Test 1: Checking if project can start new discovery...');
    
    if (project.discoveryStatus === 'running') {
      console.log('⚠️  Discovery is currently running - this would block new discovery');
    } else if (project.discoveryStatus === 'completed') {
      console.log('✅ Discovery is completed - new discovery should be allowed');
    } else if (project.discoveryStatus === 'failed') {
      console.log('✅ Discovery failed - new discovery should be allowed');
    } else {
      console.log('✅ No discovery status - new discovery should be allowed');
    }
    
    // Test 2: Simulate starting a new discovery
    console.log('\n🧪 Test 2: Simulating new discovery start...');
    
    try {
      // Reset discovery status
      await prisma.project.update({
        where: { id: project.id },
        data: {
          discoveryStatus: null,
          discoveryProgress: null,
          discoveryStartedAt: null
        }
      });
      console.log('✅ Reset discovery status successfully');
      
      // Initialize new discovery
      await prisma.project.update({
        where: { id: project.id },
        data: {
          discoveryStatus: 'running',
          discoveryStartedAt: new Date(),
          discoveryProgress: {
            stage: 'initializing',
            leadsFound: 0,
            message: 'Starting discovery process...'
          }
        }
      });
      console.log('✅ Initialized new discovery successfully');
      
      // Check the updated state
      const updatedProject = await prisma.project.findFirst({
        where: { id: project.id },
        select: {
          discoveryStatus: true,
          discoveryProgress: true,
          discoveryStartedAt: true
        }
      });
      
      console.log('📊 Updated Project State:');
      console.log(`  Discovery Status: ${updatedProject.discoveryStatus}`);
      console.log(`  Discovery Progress: ${JSON.stringify(updatedProject.discoveryProgress, null, 2)}`);
      console.log(`  Discovery Started At: ${updatedProject.discoveryStartedAt}`);
      
    } catch (error) {
      console.error('❌ Error simulating discovery start:', error);
    }
    
    // Test 3: Check for stuck discoveries
    console.log('\n🧪 Test 3: Checking for stuck discoveries...');
    
    const stuckDiscoveries = await prisma.project.findMany({
      where: {
        discoveryStatus: 'running',
        discoveryStartedAt: {
          lt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        }
      },
      select: {
        id: true,
        name: true,
        discoveryStartedAt: true,
        discoveryProgress: true
      }
    });
    
    if (stuckDiscoveries.length > 0) {
      console.log(`⚠️  Found ${stuckDiscoveries.length} stuck discoveries:`);
      stuckDiscoveries.forEach((p, index) => {
        const runningTime = Math.floor((Date.now() - new Date(p.discoveryStartedAt).getTime()) / (1000 * 60));
        console.log(`  ${index + 1}. ${p.name} (${p.id}) - running for ${runningTime} minutes`);
      });
    } else {
      console.log('✅ No stuck discoveries found');
    }
    
    // Test 4: Check recent leads
    console.log('\n🧪 Test 4: Checking recent leads...');
    
    const recentLeads = await prisma.lead.findMany({
      where: { projectId: project.id },
      orderBy: { discoveredAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        subreddit: true,
        opportunityScore: true,
        discoveredAt: true,
        status: true
      }
    });
    
    if (recentLeads.length === 0) {
      console.log('ℹ️  No leads found for this project');
    } else {
      console.log(`📊 Recent Leads (${recentLeads.length}):`);
      recentLeads.forEach((lead, index) => {
        console.log(`  ${index + 1}. ${lead.title.substring(0, 50)}...`);
        console.log(`     Subreddit: ${lead.subreddit}`);
        console.log(`     Score: ${lead.opportunityScore}`);
        console.log(`     Status: ${lead.status}`);
        console.log(`     Discovered: ${lead.discoveredAt}`);
        console.log('');
      });
    }
    
    // Test 5: Check user's Reddit connection
    console.log('\n🧪 Test 5: Checking user Reddit connection...');
    
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: {
        id: true,
        hasConnectedReddit: true,
        redditUsername: true,
        redditRefreshToken: true
      }
    });
    
    if (user) {
      console.log(`👤 User Reddit Status:`);
      console.log(`  Has Connected Reddit: ${user.hasConnectedReddit}`);
      console.log(`  Reddit Username: ${user.redditUsername || 'Not set'}`);
      console.log(`  Reddit Token: ${user.redditRefreshToken ? 'Present' : 'Missing'}`);
      
      if (!user.hasConnectedReddit || !user.redditRefreshToken) {
        console.log('⚠️  User needs to connect Reddit account for discovery to work');
      } else {
        console.log('✅ User Reddit connection looks good');
      }
    } else {
      console.log('❌ User not found');
    }
    
    console.log('\n🎯 Recommendations:');
    console.log('1. If discovery status is "completed" or "failed", new discovery should work');
    console.log('2. If discovery status is "running", it needs to be reset first');
    console.log('3. User must have Reddit account connected');
    console.log('4. Check for stuck discoveries and reset them if needed');
    
  } catch (error) {
    console.error('❌ Error testing discovery flow:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDiscoveryFlow();
