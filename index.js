const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: process.env.GH_TOKEN })


const get_default_branch = async (owner, repo) => {
    const branches_to_consider = ['main', 'master']
    
    const {data: branches} = await octokit.repos.listBranches({owner, repo})

    const branches_matching_name = branches.filter(branch => branches_to_consider.includes(branch.name))

    return branches_matching_name[0]   
}

const get_head = async () => {}
const get_latest_commit = async () => {}
const create_tree = async () => {}
const create_commit = async () => {}
const move_head_to_commit = async () => {}


const main = async function() {
    const repo = "test-terraform"
    const owner = "icbat"

    const default_branch = await get_default_branch(owner, repo)

    console.log(default_branch)

    await get_head()
    await get_latest_commit()
    await create_tree()
    await create_commit()
    await move_head_to_commit()
}

main()

