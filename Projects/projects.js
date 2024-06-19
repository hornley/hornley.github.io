let pages = []
let projects = {
    'Java':  {
        'Bank Account System': {
            'Description': 'A group project we did during our 1st year and 2nd semester.',
            'Difficulty': 1,
            'src': './images/java-bank-account-system.png',
            'Link': ''
        }
    },
    'Python' : {
        'Ant Simulation': {
            'Description': 'This project was made to demonstrate how ants find food and leave their traces for other ants to follow.',
            'Difficulty': 2,
            'src': './images/python-ant-simulation.png',
            'Link': ''
        },
        'Chess Discord Bot': {
            'Description': 'Made with Discord py, Discord API, and emojis for the pieces and board.<br>(Not finished, check/checkmate detection not implemeted)',
            'Difficulty': 2,
            'src': './images/python-chess-discord-bot.png',
            'Link': 'https://github.com/hornley/Chess-Discord-Bot'
        },
        'LeQueue': {
            'Description': '',
            'Difficulty': 1,
            'Link': ''
        },
        'Task Reminder': {
            'Description': 'A project to help manage tasks better by organizing and reminding the user.<br>(Unfinished)',
            'Difficulty': 2,
            'src': './images/python-task-reminder.png',
            'Link': 'https://github.com/hornley/taskreminder'
        }
    },
    'JavaScript': {
        'Bug Wars Game': {
            'Description': 'This game was just a for fun project to make me learn and understand more about JavaScript and collision checks.<br>(Unfinished)',
            'Difficulty': 2,
            'src': './images/javascript-bug-wars.png',
            'Link': 'https://github.com/hornley/hornley.github.io'
        }, 
        'Truth Table Generator': {
            'Description': 'Based on the subject, Symbolic Logic.',
            'Difficulty': 2,
            'src': './images/javascript-truth-table-generator.png',
            'Link': 'https://github.com/hornley/hornley.github.io'
        }
    },
    'CPP': {
        'Simple Console Game': {
            'Description': 'An RPG genre game played using the console.<br>(Unfinished)',
            'Difficulty': 1,
            'src': './images/cpp-simple-console-game.png',
            'Link': 'https://github.com/hornley/Game'
        }
    }
}
let observer

function loadProjects(language, page) {
    if (language === 'Home') return
    for (let project in projects[language]) {
        const projectData = projects[language][project]
        if (!projectData['src']) continue

        const imgElement = document.createElement('img')
        const titleElement = document.createElement('h4')
        const descriptionElement = document.createElement('h6')
        const difficultyElement = document.createElement('div')
        const projectElement = document.createElement('div')
        const linkElement = document.createElement('a')
        const linkImageElement = document.createElement('img')

        projectElement.addEventListener('mousemove', (evt) => onhover(projectElement))
        projectElement.addEventListener('mouseout', (evt) => onexit(projectElement))
        projectElement.className = 'project'

        imgElement.src = projectData['src']
        imgElement.alt = `"${project} Image`
        imgElement.className = 'image'

        titleElement.className = 'projectTitle'
        titleElement.id = 'title'
        titleElement.innerHTML = project

        descriptionElement.className = 'description'
        descriptionElement.innerHTML = 'Hover to view description and difficulty.'

        difficultyElement.className = 'difficulty'
        for (let i = 0; i < 5; i++) {
            if (i < projectData['Difficulty']) {
                const diffImageOne = document.createElement('img')
                diffImageOne.src = '../images/skill-one.png'
                difficultyElement.appendChild(diffImageOne)
            } else {
                const diffImageTwo = document.createElement('img')
                diffImageTwo.src = '../images/skill-two.png'
                difficultyElement.appendChild(diffImageTwo)
            }
        }

        const link = projectData['Link']
        if (link) {
            linkImageElement.src = './images/ProjectLinkImage.png'
            linkElement.appendChild(linkImageElement)
            linkElement.className = "ProjectLink"
            linkElement.id = "ProjectLink"
            linkElement.href = projectData['Link']
            linkElement.target = '_blank'
        }

        projectElement.appendChild(imgElement)
        projectElement.appendChild(titleElement)
        projectElement.appendChild(descriptionElement)
        projectElement.appendChild(difficultyElement)
        if (link) projectElement.appendChild(linkElement)

        page.appendChild(projectElement)
    }
}

function main() {
    if (window.location.href.includes("#")) {
        const topNav = document.getElementById("myTopnav")
        topNav.style.visibility = "hidden"
    }

    pages.push("Home")
    pages.push("Python")
    pages.push("Java")
    pages.push("JavaScript")
    pages.push("CPP")

    observer = new IntersectionObserver(function(entries) {
        const topNav = document.getElementById("myTopnav")
        const homeButton = document.getElementById("HomeButton")
        if (entries[0].isIntersecting === true) {
            if (entries[0].target.className.includes("Home")) {
                topNav.style.visibility = "visible"
                    homeButton.style.visibility = "hidden"
            } else {
                topNav.style.visibility = "hidden"
                    homeButton.style.visibility = "visible"
            }
        }
    }, { threshold: 0.8 })

    pages.forEach((page) => {
        projectPage = document.getElementById(page)
        loadProjects(page, projectPage.children[1])
        observer.observe(projectPage)
    })
}


function onhover(project) {
    if (project.children.length === 0) return
    let parentElement = project.parentElement.parentElement
    project = project.children
    let title = project[1].innerHTML
    let description = projects[parentElement.id][title]['Description']
    project[2].innerHTML = description
    project[3].style.visibility = 'visible'
    project[4].style.visibility = 'visible'
}

function onexit(project) {
    if (project.children.length === 0) return
    project = project.children
    project[2].innerHTML = 'Hover to view description and difficulty.'
    project[3].style.visibility = 'hidden'
    project[4].style.visibility = 'hidden'
}

main()