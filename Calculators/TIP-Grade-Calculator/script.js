// Grade data structure
const grades = {
  Prelim: createPeriodData(),
  Midterm: createPeriodData(),
  Final: createPeriodData()
};

let currentPeriod = "Prelim";
let categoryCounter = 1;

const topnavDiv = document.getElementById("myTopnav");
const CSContainer = document.getElementById("cs-container");
const classStandingGrade = document.getElementById("class-standing-grade");
const majorExamGrade = document.getElementById("major-exam-grade");
const gradeText = document.getElementById("grade");

document.addEventListener("input", updateGrade);

function createPeriodData() {
  return {
    "Class Standing": {
      Grade: 0,
      Modified: false
    },
    Exam: 0,
    Grade: 0
  };
}

function updateGrade() {
  let totalPercentage = 0;
  grades[currentPeriod]["Class Standing"].Grade = 0;

  CSContainer.querySelectorAll(".cs-factor").forEach((factorDiv) => {
    const header = factorDiv.querySelector(".cs-header");
    const categoryName = header.querySelector(".category-name").value;
    const percentageInput = header.querySelector(".percentage");
    const categoryGradeInput = header.querySelector(".category-grade");
    
    const percentage = parseFloat(percentageInput.value) || 0;
    totalPercentage += percentage;

    const factorData = {
      Percentage: percentage,
      Grade: 0
    };

    let subGrades = [];
    factorDiv.querySelectorAll(".cs-factor-container").forEach((container) => {
      const gradeInput = container.querySelector("#sub-category-grade");
      const grade = parseFloat(gradeInput.value) || 0;
      subGrades.push(grade);
      const nameInput = container.querySelector("input[type='text']");
      const subCategoryName = nameInput.value;
      factorData[subCategoryName] = grade;
    });

    factorData.Grade = subGrades.length > 0 ? round(subGrades.reduce((a, b) => a + b, 0) / subGrades.length) : 0;
    categoryGradeInput.value = factorData.Grade;
    grades[currentPeriod]["Class Standing"][categoryName] = factorData;
  });

  if (totalPercentage <= 100) {
    Object.entries(grades[currentPeriod]["Class Standing"]).forEach(([key, value]) => {
      if (key !== "Grade" && key !== "Modified") {
        grades[currentPeriod]["Class Standing"].Grade += (value.Grade * value.Percentage) / 100;
      }
    });

    grades[currentPeriod]["Class Standing"].Grade = round(grades[currentPeriod]["Class Standing"].Grade);
    classStandingGrade.value = grades[currentPeriod]["Class Standing"].Grade;

    const CS = round(parseFloat(classStandingGrade.value)) || 0;
    const ME = round(parseFloat(majorExamGrade.value)) || 0;

    grades[currentPeriod].Exam = ME;

    if (currentPeriod === "Prelim") {
      grades[currentPeriod].Grade = round((CS + ME) / 2);
    } else if (currentPeriod === "Midterm") {
      grades[currentPeriod].Grade = round((grades.Prelim.Grade / 3) + (2 * (CS + ME) / 3 / 2));
    } else {
      grades[currentPeriod].Grade = round((grades.Midterm.Grade / 3) + (2 * (CS + ME) / 3 / 2));
    }

    gradeText.innerText = grades[currentPeriod].Grade;
  }
}

function round(num) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function addCategory() {
  const factorDiv = document.createElement("div");
  factorDiv.className = "cs-factor";

  const header = document.createElement("div");
  header.className = "cs-header";

  const categoryName = document.createElement("input");
  categoryName.type = "text";
  categoryName.className = "category-name";
  categoryName.value = `CS-${categoryCounter++}`;
  categoryName.placeholder = "*Name*";

  const percentage = document.createElement("input");
  percentage.type = "number";
  percentage.className = "percentage";
  percentage.placeholder = "*Percentage*";
  percentage.step = "0.01";

  const categoryGrade = document.createElement("input");
  categoryGrade.type = "number";
  categoryGrade.className = "category-grade";
  categoryGrade.placeholder = "*Grade*";
  categoryGrade.readOnly = true;

  const addBtn = document.createElement("img");
  addBtn.src = "add_sub_category_button.png";
  addBtn.className = "add-sub-category-button";
  addBtn.addEventListener("click", () => addSubCategory(factorDiv));

  const delBtn = document.createElement("img");
  delBtn.src = "delete_button.png";
  delBtn.className = "delete-button";
  delBtn.addEventListener("click", () => factorDiv.remove());

  [categoryName, percentage, addBtn, delBtn, categoryGrade].forEach(el => header.appendChild(el));
  factorDiv.appendChild(header);
  CSContainer.appendChild(factorDiv);
}

function addSubCategory(parent) {
  const container = document.createElement("div");
  container.className = "cs-factor-container";

  const subName = document.createElement("input");
  subName.type = "text";
  subName.placeholder = "*Name*";
  subName.value = `${parent.querySelector(".category-name").value}#${parent.querySelectorAll(".cs-factor-container").length + 1}`;

  const grade = document.createElement("input");
  grade.type = "number";
  grade.id = "sub-category-grade";
  grade.placeholder = "*Grade*";
  grade.step = "0.01";

  const delBtn = document.createElement("img");
  delBtn.src = "delete_button.png";
  delBtn.className = "delete-button";
  delBtn.addEventListener("click", () => container.remove());

  [subName, delBtn, grade].forEach(el => container.appendChild(el));
  parent.appendChild(container);
}

function gradePeriod(clickedNode) {
  topnavDiv.querySelectorAll("div").forEach(node => {
    node.id = (node === clickedNode) ? "active" : "";
  });
  grades[currentPeriod].innerHTML = CSContainer.innerHTML;
  currentPeriod = clickedNode.innerText.trim();
  CSContainer.innerHTML = "";
  majorExamGrade.value = grades[currentPeriod].Exam || 0;
  classStandingGrade.value = grades[currentPeriod]["Class Standing"].Grade || 0;
  gradeText.innerText = grades[currentPeriod].Grade || 0;
  // Note: loadPeriod() can be re-implemented if you want to restore category nodes
}
