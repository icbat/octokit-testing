const { Octokit } = require("@octokit/rest");
// this token needs REPO access to be able to do its work. Otherise you'll start seeing 404's later in the program
console.log(process.env.GH_TOKEN)
const octokit = new Octokit({ auth: process.env.GH_TOKEN })


// this whole concept is worth some discussion. how to handle this? GH is moving from master -> main in new repos
const get_default_branch = async (args) => {
    const branches_to_consider = ['main', 'master']
    
    const {data: branches} = await octokit.repos.listBranches(args)

    const branches_matching_name = branches.filter(branch => branches_to_consider.includes(branch.name))

    return branches_matching_name[0]   
}

const main = async function() {
    const repo = "test-terraform"
    const owner = "icbat"

    const { name } = await get_default_branch({owner, repo})
    const ref = `heads/${name}`

    const {data: {object: {sha: latest_commit_sha} }} = await octokit.git.getRef({ owner, repo, ref})

    const tree = [{
        path: 'asdf.txt',
        mode: '100644',
        type: 'blob',

        // docs say this can be null, but Javascript says otherwise :(
        // sha: null, 

        // this is an alternative to having an additional step that creates a Blog on its own
        content: 'This is a super cool file',
    }]

    const { data: { sha: tree_sha } } = await octokit.git.createTree({ owner, repo, tree, base_tree: latest_commit_sha})
    console.log("tree created", tree_sha)

    const message = `Automated commit - SPIKE REPO: ${Math.random()}`
    const parents = [latest_commit_sha]
    // author and committer are optional args here for overriding the auth'd user as the committer/author. could be useful.
    const {data: { sha: new_commit_sha }} = await octokit.git.createCommit({ owner, repo, message, tree: tree_sha, parents})

    console.log('committing')
    await octokit.git.updateRef({owner, repo, ref, sha: new_commit_sha})
}

main().catch(e => console.error(e, e.headers.status))

