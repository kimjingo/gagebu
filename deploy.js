const crypto = require('crypto');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

/**
 * Verify GitHub webhook signature
 */
function verifyGitHubSignature(payload, signature, secret) {
    if (!signature) {
        return false;
    }

    // Ensure payload is a string or Buffer for correct HMAC computation
    const body = Buffer.isBuffer(payload) ? payload : String(payload);
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(body).digest('hex');

    const sigBuffer = Buffer.from(signature);
    const digestBuffer = Buffer.from(digest);

    // timingSafeEqual throws if lengths differ
    if (sigBuffer.length !== digestBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(sigBuffer, digestBuffer);
}

/**
 * Execute deployment steps
 */
async function deploy() {
    console.log('\n🚀 Starting deployment...');
    const deploymentSteps = [];

    try {
        // Step 1: Pull latest code
        console.log('📥 Pulling latest code from GitHub...');
        const { stdout: pullOutput, stderr: pullError } = await execPromise('git pull origin main');
        deploymentSteps.push({
            step: 'Git Pull',
            success: true,
            output: pullOutput || 'Already up to date'
        });
        console.log(pullOutput);

        // Step 2: Install dependencies (if package.json changed)
        console.log('📦 Installing dependencies...');
        const { stdout: installOutput } = await execPromise('npm install --production');
        deploymentSteps.push({
            step: 'NPM Install',
            success: true,
            output: 'Dependencies updated'
        });
        console.log('✓ Dependencies installed');

        // Step 3: Run database migrations (if needed)
        console.log('🗄️  Checking database migrations...');
        deploymentSteps.push({
            step: 'Database Migrations',
            success: true,
            output: 'Migrations are handled automatically on startup'
        });

        // Step 4: Restart application (using PM2 if available)
        console.log('🔄 Restarting application...');
        try {
            // Try PM2 first
            await execPromise('pm2 restart household-accounting');
            deploymentSteps.push({
                step: 'Application Restart',
                success: true,
                output: 'Restarted via PM2'
            });
            console.log('✓ Application restarted via PM2');
        } catch (pm2Error) {
            // If PM2 not available, just note it needs manual restart
            deploymentSteps.push({
                step: 'Application Restart',
                success: true,
                output: 'PM2 not found - manual restart required'
            });
            console.log('⚠️  PM2 not found. Application will restart automatically if using nodemon or similar.');
        }

        console.log('\n✅ Deployment completed successfully!\n');

        return {
            success: true,
            message: 'Deployment completed successfully',
            steps: deploymentSteps,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);

        return {
            success: false,
            message: 'Deployment failed: ' + error.message,
            error: error.message,
            steps: deploymentSteps,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Handle GitHub webhook event
 */
async function handleWebhook(event, payload) {
    console.log(`\n📨 Received GitHub event: ${event}`);

    // Only deploy on push events to main branch
    if (event === 'push') {
        const ref = payload.ref;
        const branch = ref ? ref.split('/').pop() : '';

        console.log(`Branch: ${branch}`);

        if (branch === 'main' || branch === 'master') {
            console.log('✓ Push to main/master branch detected');

            // Get commit info
            if (payload.commits && payload.commits.length > 0) {
                const latestCommit = payload.commits[0];
                console.log(`Commit: ${latestCommit.message}`);
                console.log(`Author: ${latestCommit.author.name}`);
            }

            // Execute deployment
            const result = await deploy();
            return result;
        } else {
            console.log(`⏭️  Skipping deployment - not main/master branch`);
            return {
                success: true,
                message: `Webhook received but deployment skipped (branch: ${branch})`,
                timestamp: new Date().toISOString()
            };
        }
    } else if (event === 'ping') {
        console.log('✓ Ping event - webhook is configured correctly');
        return {
            success: true,
            message: 'Pong! Webhook is working',
            timestamp: new Date().toISOString()
        };
    } else {
        console.log(`⏭️  Event type '${event}' - no action taken`);
        return {
            success: true,
            message: `Event '${event}' received but no deployment triggered`,
            timestamp: new Date().toISOString()
        };
    }
}

module.exports = {
    verifyGitHubSignature,
    handleWebhook,
    deploy
};
