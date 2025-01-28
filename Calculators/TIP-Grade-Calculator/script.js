const topnavDiv = document.getElementById("myTopnav")
const CSContainer = document.getElementById("cs-container")
const grades = {
    "Prelim": {
        "Class Standing": {
            "Grade": 0,
            "CS-1": {

            }
        },
        "Exam": 0,
        "Grade": 0
    },
    "Midterm": {
        "Class Standing": {
            "Grade": 0
        },
        "Exam": 0,
        "Grade": 0
    },
    "Final": {
        "Class Standing": {
            "Grade": 0
        },
        "Exam": 0,
        "Grade": 0
    }
}
let currentPeriod = "Prelim"

const classStandingGrade = document.getElementById("class-standing-grade")
const majorExamGrade = document.getElementById("major-exam-grade")
const gradeText = document.getElementById("grade")

function updateGrade() {
    let total_cs_percentage = 0

    grades[currentPeriod]["Class Standing"] = {"Grade": 0}

    CSContainer.childNodes.forEach((node) => {
        if (node.className === "cs-factor") {
            const nodeName = node.firstChild.firstChild.value
            grades[currentPeriod]["Class Standing"][nodeName] = {"Percentage": 0, "Grade": 0}
            
            let grade = 0

            let factor_node_count = 1
            node.childNodes.forEach((factor_node) => { // The header for the factor "Quiz"
                if (factor_node.className === "cs-factor-container") { // Factor name/number "Quiz 1"
                    factor_node.firstChild.value = nodeName + "#" + factor_node_count
                    grades[currentPeriod]["Class Standing"][nodeName][factor_node.firstChild.value] = parseFloat(factor_node.lastChild.value) || 0
                    grade += parseFloat(factor_node.lastChild.value) || 0
                    factor_node_count++
                }
            })

            grades[currentPeriod]["Class Standing"][nodeName]["Percentage"] = round(parseFloat(node.firstChild.childNodes[2].value))
            grades[currentPeriod]["Class Standing"][nodeName]["Grade"] = round(grade / (Object.keys(grades[currentPeriod]["Class Standing"][nodeName]).length - 2))
            node.firstChild.lastChild.value = grades[currentPeriod]["Class Standing"][nodeName]["Grade"]
            total_cs_percentage += parseFloat(node.firstChild.childNodes[2].value) || 0
        }
    })
    if (0 >= total_cs_percentage <= 100) {
        grades[currentPeriod]["Class Standing"]["Grade"] = 0
        Object.keys(grades[currentPeriod]["Class Standing"]).forEach((factor) => {
            if (factor !== "Grade") {
                grades[currentPeriod]["Class Standing"]["Grade"] += grades[currentPeriod]["Class Standing"][factor]["Grade"] * grades[currentPeriod]["Class Standing"][factor]["Percentage"] / 100
            }
        })
        grades[currentPeriod]["Class Standing"]["Grade"] = round(grades[currentPeriod]["Class Standing"]["Grade"])
        classStandingGrade.value = grades[currentPeriod]["Class Standing"]["Grade"]

        let CS = round(parseFloat(classStandingGrade.value)) || 0
        let ME = round(parseFloat(majorExamGrade.value)) || 0
    
        grades[currentPeriod]["Exam"] = ME

        if (currentPeriod === "Prelim")
            grades[currentPeriod]["Grade"] = round(CS/2 + ME/2)
        else if (currentPeriod === "Midterm")
            grades[currentPeriod]["Grade"] = round(1/3*(grades["Prelim"]["Grade"]) + 2/3*(CS/2 + ME/2))
        else
            grades[currentPeriod]["Grade"] = round(1/3*(grades["Midterm"]["Grade"]) + 2/3*(CS/2 + ME/2))

        gradeText.innerText = grades[currentPeriod]["Grade"]
    }
}

setInterval(updateGrade, 500)

function loadPeriod() {
    Object.keys(grades[currentPeriod]["Class Standing"]).forEach((factor) => {
        if (factor !== "Grade") {
            const factorDiv = document.createElement('div')
            factorDiv.className = "cs-factor"
            factorDiv.id = "cs-factor"
            const headerDiv = document.createElement('div')
            headerDiv.className = "cs-header"
        
            const spacer1 = document.createElement('div')
            spacer1.className = "spacer"
            const spacer2 = document.createElement('div')
            spacer2.className = "spacer"
            const spacer3 = document.createElement('div')
            spacer3.className = "spacer"
            const spacer4 = document.createElement('div')
            spacer4.className = "spacer"
        
            const categoryName = document.createElement('input')
            categoryName.className = "category-name"
            categoryName.value = factor
            categoryName.type = "text"
            categoryName.placeholder = "*Name*"
        
            const percentage = document.createElement('input')
            percentage.type = "text"
            percentage.id = "percentage"
            percentage.className = "percentage"
            percentage.placeholder = "*Percentage*"
            percentage.value = grades[currentPeriod]["Class Standing"][factor]["Percentage"]
        
            const categoryGrade = document.createElement('input')
            categoryGrade.type = "text"
            categoryGrade.id = "category-grade"
            categoryGrade.placeholder = "*Grade*"
        
            const subCategoryButton = document.createElement('img')
            subCategoryButton.className = "add-sub-category-button"
            subCategoryButton.addEventListener('click', addSubCategory)
            subCategoryButton.src = "add_sub_category_button.png"

            const deleteButton = document.createElement('img')
            deleteButton.className = "delete-button"
            deleteButton.addEventListener('click', deleteCategory)
            deleteButton.src = "delete_button.png"
        
            headerDiv.appendChild(categoryName)
            headerDiv.appendChild(spacer1)
            headerDiv.appendChild(percentage)
            headerDiv.appendChild(spacer2)
            headerDiv.appendChild(subCategoryButton)
            headerDiv.appendChild(spacer3)
            headerDiv.appendChild(deleteButton)
            headerDiv.appendChild(spacer4)
            headerDiv.appendChild(categoryGrade)
        
            factorDiv.appendChild(headerDiv)

            let count = 1
            Object.keys(grades[currentPeriod]["Class Standing"][factor]).forEach((factor_node) => {
                if (factor_node !== "Percentage" && factor_node !== "Grade") {
                    const headerDiv = document.createElement('div')
                    headerDiv.className = "cs-factor-container"
    
                    const spacer1 = document.createElement('div')
                    spacer1.className = "spacer"
                    const spacer2 = document.createElement('div')
                    spacer2.className = "spacer"
    
                    const subCategoryName = document.createElement('input')
                    subCategoryName.value = factor_node
                    subCategoryName.type = "text"
                    subCategoryName.placeholder = "*Name*"
    
                    const categoryGrade = document.createElement('input')
                    categoryGrade.value = grades[currentPeriod]["Class Standing"][factor][factor_node]
                    categoryGrade.type = "text"
                    categoryGrade.id = "sub-category-grade"
                    categoryGrade.placeholder = "*Grade*"

                    const deleteButton = document.createElement('img')
                    deleteButton.className = "delete-button"
                    deleteButton.addEventListener('click', deleteSubCategory)
                    deleteButton.src = "delete_button.png"

                    headerDiv.appendChild(subCategoryName)
                    headerDiv.appendChild(spacer1)
                    headerDiv.appendChild(deleteButton)
                    headerDiv.appendChild(spacer2)
                    headerDiv.appendChild(categoryGrade)
    
                    factorDiv.appendChild(headerDiv)
                    count++
                }
            })

            CSContainer.appendChild(factorDiv)
        }
    })
    majorExamGrade.value = grades[currentPeriod]["Exam"] || 0
}

function gradePeriod(clickedNode) {    
    topnavDiv.childNodes.forEach((node) => {
        node.id = (node === clickedNode) ? "active" : "";
    })
    grades[currentPeriod]["innerHTML"] = CSContainer.innerHTML
    currentPeriod = clickedNode.innerHTML
    CSContainer.innerHTML = ''
    majorExamGrade.value = 0
    loadPeriod()
    console.log(grades)
}

function addCategory() {
    const factorDiv = document.createElement('div')
    factorDiv.className = "cs-factor"
    factorDiv.id = "cs-factor"
    const headerDiv = document.createElement('div')
    headerDiv.className = "cs-header"

    const spacer1 = document.createElement('div')
    spacer1.className = "spacer"
    const spacer2 = document.createElement('div')
    spacer2.className = "spacer"
    const spacer3 = document.createElement('div')
    spacer3.className = "spacer"
    const spacer4 = document.createElement('div')
    spacer4.className = "spacer"

    const categoryName = document.createElement('input')
    categoryName.className = "category-name"
    categoryName.value = "CS-" + CSContainer.childNodes.length
    categoryName.type = "text"
    categoryName.placeholder = "*Name*"

    const percentage = document.createElement('input')
    percentage.type = "text"
    percentage.id = "percentage"
    percentage.className = "percentage"
    percentage.placeholder = "*Percentage*"

    const categoryGrade = document.createElement('input')
    categoryGrade.type = "text"
    categoryGrade.id = "category-grade"
    categoryGrade.placeholder = "*Grade*"

    const subCategoryButton = document.createElement('img')
    subCategoryButton.className = "add-sub-category-button"
    subCategoryButton.addEventListener('click', addSubCategory)
    subCategoryButton.src = "add_sub_category_button.png"

    const deleteButton = document.createElement('img')
    deleteButton.className = "delete-button"
    deleteButton.addEventListener('click', deleteCategory)
    deleteButton.src = "delete_button.png"

    headerDiv.appendChild(categoryName)
    headerDiv.appendChild(spacer1)
    headerDiv.appendChild(percentage)
    headerDiv.appendChild(spacer2)
    headerDiv.appendChild(subCategoryButton)
    headerDiv.appendChild(spacer3)
    headerDiv.appendChild(deleteButton)
    headerDiv.appendChild(spacer4)
    headerDiv.appendChild(categoryGrade)

    grades["Prelim"]["Class Standing"]["CS-" + CSContainer.childNodes.length] = {}
    grades["Midterm"]["Class Standing"]["CS-" + CSContainer.childNodes.length] = {}
    grades["Final"]["Class Standing"]["CS-" + CSContainer.childNodes.length] = {}

    factorDiv.appendChild(headerDiv)
    CSContainer.appendChild(factorDiv)
}

function addSubCategory(node) {
    const parentNode = node.srcElement.parentNode.parentNode
    const percentage = parentNode.firstChild.childNodes[2].value
    
    if (percentage === "") {
        // alert("Fill enter a percentage first!")
        // return
    }

    grades["Prelim"]["Class Standing"][parentNode.firstChild.firstChild.value]["Percentage"] = parseFloat(percentage)
    grades["Midterm"]["Class Standing"][parentNode.firstChild.firstChild.value]["Percentage"] = parseFloat(percentage)
    grades["Final"]["Class Standing"][parentNode.firstChild.firstChild.value]["Percentage"] = parseFloat(percentage)

    const headerDiv = document.createElement('div')
    headerDiv.className = "cs-factor-container"

    const spacer1 = document.createElement('div')
    spacer1.className = "spacer"
    const spacer2 = document.createElement('div')
    spacer2.className = "spacer"

    const subCategoryName = document.createElement('input')
    subCategoryName.value = parentNode.firstChild.firstChild.value + "#" + parentNode.childNodes.length
    subCategoryName.type = "text"
    subCategoryName.placeholder = "*Name*"

    const categoryGrade = document.createElement('input')
    categoryGrade.type = "text"
    categoryGrade.id = "sub-category-grade"
    categoryGrade.placeholder = "*Grade*"

    const deleteButton = document.createElement('img')
    deleteButton.className = "delete-button"
    deleteButton.addEventListener('click', deleteSubCategory)
    deleteButton.src = "delete_button.png"

    headerDiv.appendChild(subCategoryName)
    headerDiv.appendChild(spacer1)
    headerDiv.appendChild(deleteButton)
    headerDiv.appendChild(spacer2)
    headerDiv.appendChild(categoryGrade)

    parentNode.appendChild(headerDiv)
}

function deleteCategory(node) {
    delete grades[currentPeriod]["Class Standing"][node.srcElement.parentNode.firstChild.value]
    CSContainer.removeChild(node.srcElement.parentNode.parentNode)
}

function deleteSubCategory(node) {
    node.srcElement.parentNode.parentNode.removeChild(node.srcElement.parentNode)
}

function round(num) {
    return Math.round((num + Number.EPSILON) * 100)/100
}
