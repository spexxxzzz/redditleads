const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetStuckDiscovery() {
    try {
        console.log('🔍 Looking for stuck discovery processes...');
        
        // Find projects with discovery status 'running' that started more than 2 minutes ago
        const stuckDiscoveries = await prisma.project.findMany({
            where: {
                discoveryStatus: 'running',
                discoveryStartedAt: {
                    lt: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
                }
            }
        });
        
        console.log(`Found ${stuckDiscoveries.length} stuck discovery processes`);
        
        for (const project of stuckDiscoveries) {
            console.log(`🔄 Resetting stuck discovery for project: ${project.id}`);
            console.log(`   Started at: ${project.discoveryStartedAt}`);
            console.log(`   Time since start: ${Math.round((Date.now() - new Date(project.discoveryStartedAt).getTime()) / 1000)} seconds`);
            
            await prisma.project.update({
                where: { id: project.id },
                data: {
                    discoveryStatus: 'failed',
                    discoveryProgress: {
                        stage: 'failed',
                        leadsFound: 0,
                        message: 'Discovery was stuck and has been reset. Please try again.'
                    }
                }
            });
            
            console.log(`✅ Reset completed for project: ${project.id}`);
        }
        
        console.log('🎉 All stuck discoveries have been reset!');
        
    } catch (error) {
        console.error('❌ Error resetting stuck discoveries:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetStuckDiscovery();
