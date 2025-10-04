const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetDiscoveryStatus() {
  try {
    console.log('🔍 Finding projects with running discovery status...');
    
    // Find all projects with 'running' status
    const runningProjects = await prisma.project.findMany({
      where: {
        discoveryStatus: 'running'
      },
      select: {
        id: true,
        name: true,
        discoveryStatus: true,
        discoveryStartedAt: true
      }
    });
    
    console.log(`Found ${runningProjects.length} projects with running discovery status:`);
    runningProjects.forEach(project => {
      console.log(`- ${project.name} (${project.id}): ${project.discoveryStatus} since ${project.discoveryStartedAt}`);
    });
    
    if (runningProjects.length === 0) {
      console.log('✅ No projects with running discovery status found.');
      return;
    }
    
    // Reset all running projects to null (not started)
    const updateResult = await prisma.project.updateMany({
      where: {
        discoveryStatus: 'running'
      },
      data: {
        discoveryStatus: null,
        discoveryStartedAt: null,
        discoveryProgress: null
      }
    });
    
    console.log(`✅ Reset ${updateResult.count} projects to not started status.`);
    
  } catch (error) {
    console.error('❌ Error resetting discovery status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDiscoveryStatus();
