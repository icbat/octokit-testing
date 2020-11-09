const { Octokit } = require("@octokit/rest");
console.log(process.env.GH_TOKEN)
const octokit = new Octokit({ auth: process.env.GH_TOKEN })


const get_default_branch = async (args) => {
    const branches_to_consider = ['main', 'master']
    
    const {data: branches} = await octokit.repos.listBranches(args)

    const branches_matching_name = branches.filter(branch => branches_to_consider.includes(branch.name))

    return branches_matching_name[0]   
}

const main = async function() {
    const repo = "test-terraform"
    const owner = "icbat"

    const {name, sha: parent_sha} = await get_default_branch({owner, repo})
    const ref = `refs/heads/${name}`

    const content = "thisIsContent"
    const encoding = 'utf-8' // only other option is base64, we probably wnat that to minimize bandwidth usage, but node doesn't have it naturally
    const { data: {sha: blob_sha} } = await octokit.git.createBlob({owner, repo, content, encoding})
    console.log('blob sha', blob_sha)
    
    const tree = {
        path: 'asdf.txt',
        mode: '100644', // blob  (but not executable)
        type: 'blob',
        // sha: null, // use only if you do an individual step to make the blog, if so kill content
        // content: 'this is content definitely \n a great file',
        sha: blob_sha, // use only if you do an individual step to make the blog, if so kill content
        // content: 'this is content definitely \n a great file',
    }

    const {data: {sha: tree_sha}} = await octokit.git.createTree({owner, repo, tree})
    console.log("tree created", tree_sha)

    const message = `Automated commit - SPIKE REPO: ${Math.random()}`
    const parents = [parent_sha]
    // author and committer are optional args here for overriding the auth'd user as the committer/author. could be useful.
    const {data: { sha: new_commit_sha }} = await octokit.git.createCommit({ owner, repo, message, tree_sha, parents})

    console.log('committing')
    await octokit.git.updateRef({owner, repo, ref, sha: new_commit_sha})
}

main().catch(e => console.error(e.headers.status))

