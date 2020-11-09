const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({ auth: process.env.GH_TOKEN })

const main = async function() {
    const { data: pullRequest } = await octokit.pulls.get({
        owner: "octokit",
        repo: "rest.js",
        pull_number: 123,
    });

    console.log(pullRequest)
}

main()

