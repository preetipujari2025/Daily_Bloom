// =====================================================
// DAILY BLOOM - FRONTEND JAVASCRIPT
// =====================================================

const API_URL = "http://localhost:5000";


// =====================================================
// HTML ELEMENTS
// =====================================================

const welcomeSection = document.getElementById("welcome-section");
const nameInput = document.getElementById("name-input");
const startJourneyButton = document.getElementById("start-journey");

const userNameElement = document.getElementById("user-name");
const greetingElement = document.getElementById("greeting");
const currentDateElement = document.getElementById("current-date");

const todayTaskList = document.getElementById("today-task-list");
const tomorrowTaskList = document.getElementById("tomorrow-task-list");
const weeklyGoalList = document.getElementById("weekly-goal-list");

const addTaskButton = document.getElementById("add-task");
const addTomorrowTaskButton = document.getElementById("add-tomorrow-task");
const addGoalButton = document.getElementById("add-goal");

const journalTextarea = document.getElementById("journaling-today");
const saveJournalButton = document.getElementById("journaling-today-btn");


// =====================================================
// HABIT ELEMENTS
// These match your HTML IDs
// =====================================================

const habitCheckboxes = [
    document.getElementById("yoga"),
    document.getElementById("english-speaking"),
    document.getElementById("read-book"),
    document.getElementById("dsa")
];


// =====================================================
// DATE FUNCTIONS
// =====================================================

function getDateString(date = new Date()) {

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1)
        .padStart(2, "0");

    const day = String(date.getDate())
        .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getTomorrowDate() {

    const tomorrow = new Date();

    tomorrow.setDate(
        tomorrow.getDate() + 1
    );

    return getDateString(tomorrow);
}


// =====================================================
// GREETING
// =====================================================

function updateGreeting() {

    const hour = new Date().getHours();

    let greeting;

    if (hour < 12) {

        greeting = "Good morning 🌷";

    } else if (hour < 17) {

        greeting = "Good afternoon 🌷";

    } else {

        greeting = "Good evening 🌷";

    }

    greetingElement.textContent = greeting;
}


function updateDate() {

    const today = new Date();

    const formattedDate =
        today.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });

    currentDateElement.textContent =
        `Date: ${formattedDate}`;
}


// =====================================================
// USER
// =====================================================

function getUserId() {

    return localStorage.getItem("userId");
}


function getUserName() {

    return localStorage.getItem("userName");
}


function showUser() {

    const userName = getUserName();

    if (userName) {

        userNameElement.textContent =
            `${userName}!`;

        welcomeSection.style.display = "none";

    } else {

        welcomeSection.style.display = "block";

    }
}


// =====================================================
// CREATE USER
// =====================================================

startJourneyButton.addEventListener(
    "click",
    async function () {

        const name =
            nameInput.value.trim();

        if (!name) {

            alert("Please enter your name.");

            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/api/users`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name: name
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to create user"
                );
            }

            localStorage.setItem(
                "userId",
                data.userId
            );

            localStorage.setItem(
                "userName",
                data.name
            );

            showUser();

            await loadAllData();

        } catch (error) {

            console.error(
                "Error creating user:",
                error
            );

            alert(
                "Could not connect to the server."
            );
        }
    }
);


// =====================================================
// TASK DISPLAY
// =====================================================

function displayTask(task, listElement) {

    const li = document.createElement("li");

    li.style.marginBottom = "10px";

    const checkbox =
        document.createElement("input");

    checkbox.type = "checkbox";

    checkbox.checked =
        Number(task.completed) === 1;


    const label =
        document.createElement("label");

    label.textContent =
        ` ${task.task_text}`;


    const deleteButton =
        document.createElement("button");

    deleteButton.textContent = " 🗑️";

    deleteButton.style.marginLeft = "10px";

    deleteButton.style.cursor = "pointer";


    function updateAppearance() {

        if (checkbox.checked) {

            label.style.textDecoration =
                "line-through";

            label.style.opacity = "0.6";

        } else {

            label.style.textDecoration =
                "none";

            label.style.opacity = "1";
        }
    }


    updateAppearance();


    // Complete / uncomplete task

    checkbox.addEventListener(
        "change",
        async function () {

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/tasks/${task.id}`,
                        {
                            method: "PATCH",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                completed:
                                    checkbox.checked
                            })
                        }
                    );

                if (!response.ok) {

                    throw new Error(
                        "Failed to update task"
                    );
                }

                updateAppearance();

                loadProgress();

            } catch (error) {

                console.error(
                    "Error updating task:",
                    error
                );

                checkbox.checked =
                    !checkbox.checked;

                updateAppearance();

                alert(
                    "Could not update the task."
                );
            }
        }
    );


    // Delete task

    deleteButton.addEventListener(
        "click",
        async function () {

            const confirmDelete =
                confirm("Delete this task?");

            if (!confirmDelete) {
                return;
            }

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/tasks/${task.id}`,
                        {
                            method: "DELETE"
                        }
                    );

                if (!response.ok) {

                    throw new Error(
                        "Failed to delete task"
                    );
                }

                li.remove();

                loadProgress();

            } catch (error) {

                console.error(
                    "Error deleting task:",
                    error
                );

                alert(
                    "Could not delete the task."
                );
            }
        }
    );


    li.appendChild(checkbox);

    li.appendChild(label);

    li.appendChild(deleteButton);

    listElement.appendChild(li);
}


// =====================================================
// LOAD TASKS
// =====================================================

async function loadTasks(
    date,
    listElement
) {

    const userId = getUserId();

    if (!userId) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/tasks?user_id=${userId}&date=${date}`
            );

        const tasks =
            await response.json();

        if (!response.ok) {

            throw new Error(
                tasks.message ||
                "Failed to load tasks"
            );
        }

        listElement.innerHTML = "";

        tasks.forEach(function (task) {

            displayTask(
                task,
                listElement
            );

        });

    } catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );
    }
}


// =====================================================
// ADD TASK
// =====================================================

async function addTask(date) {

    const userId = getUserId();

    if (!userId) {

        alert(
            "Please enter your name first."
        );

        return;
    }

    const taskText =
        prompt(
            "What task do you want to add?"
        );

    if (
        taskText === null ||
        taskText.trim() === ""
    ) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/tasks`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        user_id: userId,

                        task_text:
                            taskText.trim(),

                        task_date: date

                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to create task"
            );
        }

        if (date === getDateString()) {

            await loadTasks(
                date,
                todayTaskList
            );

        } else {

            await loadTasks(
                date,
                tomorrowTaskList
            );
        }

        loadProgress();

    } catch (error) {

        console.error(
            "Error creating task:",
            error
        );

        alert(
            "Could not save the task."
        );
    }
}


addTaskButton.addEventListener(
    "click",
    function () {

        addTask(
            getDateString()
        );

    }
);


addTomorrowTaskButton.addEventListener(
    "click",
    function () {

        addTask(
            getTomorrowDate()
        );

    }
);


// =====================================================
// GOALS
// =====================================================

async function loadGoals() {

    const userId = getUserId();

    if (!userId) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/goals?user_id=${userId}`
            );

        const goals =
            await response.json();

        if (!response.ok) {

            throw new Error(
                goals.message ||
                "Failed to load goals"
            );
        }

        weeklyGoalList.innerHTML = "";

        goals.forEach(function (goal) {

            const li =
                document.createElement("li");

            li.style.marginBottom = "10px";


            const checkbox =
                document.createElement("input");

            checkbox.type = "checkbox";

            checkbox.checked =
                Number(goal.completed) === 1;


            const label =
                document.createElement("label");

            label.textContent =
                ` ${goal.goal_text}`;


            const deleteButton =
                document.createElement("button");

            deleteButton.textContent =
                " 🗑️";

            deleteButton.style.marginLeft =
                "10px";

            deleteButton.style.cursor =
                "pointer";


            function updateGoalStyle() {

                if (checkbox.checked) {

                    label.style.textDecoration =
                        "line-through";

                    label.style.opacity =
                        "0.6";

                } else {

                    label.style.textDecoration =
                        "none";

                    label.style.opacity =
                        "1";
                }
            }


            updateGoalStyle();


            checkbox.addEventListener(
                "change",
                async function () {

                    try {

                        const response =
                            await fetch(
                                `${API_URL}/api/goals/${goal.id}`,
                                {
                                    method: "PATCH",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body: JSON.stringify({
                                        completed:
                                            checkbox.checked
                                    })
                                }
                            );

                        if (!response.ok) {

                            throw new Error(
                                "Failed to update goal"
                            );
                        }

                        updateGoalStyle();

                    } catch (error) {

                        console.error(
                            "Error updating goal:",
                            error
                        );

                        checkbox.checked =
                            !checkbox.checked;

                        updateGoalStyle();

                    }
                }
            );


            deleteButton.addEventListener(
                "click",
                async function () {

                    if (
                        !confirm(
                            "Delete this goal?"
                        )
                    ) {
                        return;
                    }

                    try {

                        const response =
                            await fetch(
                                `${API_URL}/api/goals/${goal.id}`,
                                {
                                    method: "DELETE"
                                }
                            );

                        if (!response.ok) {

                            throw new Error(
                                "Failed to delete goal"
                            );
                        }

                        li.remove();

                    } catch (error) {

                        console.error(
                            "Error deleting goal:",
                            error
                        );

                        alert(
                            "Could not delete the goal."
                        );
                    }
                }
            );


            li.appendChild(checkbox);

            li.appendChild(label);

            li.appendChild(deleteButton);

            weeklyGoalList.appendChild(li);

        });

    } catch (error) {

        console.error(
            "Error loading goals:",
            error
        );
    }
}


// =====================================================
// ADD GOAL
// =====================================================

addGoalButton.addEventListener(
    "click",
    async function () {

        const userId = getUserId();

        if (!userId) {

            alert(
                "Please enter your name first."
            );

            return;
        }

        const goalText =
            prompt(
                "What is your weekly goal?"
            );

        if (
            goalText === null ||
            goalText.trim() === ""
        ) {
            return;
        }

        try {

            const response =
                await fetch(
                    `${API_URL}/api/goals`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            user_id: userId,

                            goal_text:
                                goalText.trim()

                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to create goal"
                );
            }

            await loadGoals();

        } catch (error) {

            console.error(
                "Error creating goal:",
                error
            );

            alert(
                "Could not save the goal."
            );
        }
    }
);


// =====================================================
// HABITS
// =====================================================

async function loadHabits() {

    const userId = getUserId();

    if (!userId) {
        return;
    }

    const today =
        getDateString();

    try {

        const response =
            await fetch(
                `${API_URL}/api/habits?user_id=${userId}&date=${today}`
            );

        const habits =
            await response.json();

        if (!response.ok) {

            throw new Error(
                habits.message ||
                "Failed to load habits"
            );
        }


        habitCheckboxes.forEach(
            function (checkbox) {

                if (!checkbox) {
                    return;
                }

                const habitName =
                    checkbox.dataset.habit ||
                    getHabitName(checkbox.id);


                const savedHabit =
                    habits.find(
                        function (habit) {

                            return (
                                habit.habit_name ===
                                habitName
                            );

                        }
                    );


                if (savedHabit) {

                    checkbox.checked =
                        Number(
                            savedHabit.completed
                        ) === 1;

                } else {

                    checkbox.checked = false;

                }

            }
        );

    } catch (error) {

        console.error(
            "Error loading habits:",
            error
        );
    }
}


// Convert HTML checkbox ID into database habit name

function getHabitName(id) {

    const habitNames = {

        "yoga":
            "Yoga",

        "english-speaking":
            "Practice English Speaking",

        "read-book":
            "Read a book",

        "dsa":
            "Solving DSA"

    };

    return habitNames[id] || id;
}


// Save habit whenever checkbox changes

habitCheckboxes.forEach(
    function (checkbox) {

        if (!checkbox) {
            return;
        }

        checkbox.addEventListener(
            "change",
            async function () {

                const userId =
                    getUserId();

                if (!userId) {

                    alert(
                        "Please enter your name first."
                    );

                    checkbox.checked =
                        !checkbox.checked;

                    return;
                }


                const habitName =
                    getHabitName(
                        checkbox.id
                    );


                try {

                    const response =
                        await fetch(
                            `${API_URL}/api/habits`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    user_id:
                                        userId,

                                    habit_name:
                                        habitName,

                                    completed:
                                        checkbox.checked,

                                    habit_date:
                                        getDateString()

                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Failed to save habit"
                        );
                    }


                    console.log(
                        "Habit saved:",
                        data
                    );

                    loadProgress();

                } catch (error) {

                    console.error(
                        "Error saving habit:",
                        error
                    );

                    checkbox.checked =
                        !checkbox.checked;

                    alert(
                        "Could not save the habit."
                    );
                }

            }
        );

    }
);


// =====================================================
// JOURNAL
// =====================================================

async function loadJournal() {

    const userId = getUserId();

    if (!userId) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/api/journal?user_id=${userId}&date=${getDateString()}`
            );

        const journal =
            await response.json();

        if (!response.ok) {

            throw new Error(
                journal.message ||
                "Failed to load journal"
            );
        }

        if (!journal) {
            return;
        }


        journalTextarea.value =
            journal.journal_text || "";


        if (journal.mood) {

            const moodRadio =
                document.querySelector(
                    `input[name="mood"][value="${journal.mood}"]`
                );

            if (moodRadio) {

                moodRadio.checked = true;

            }
        }

    } catch (error) {

        console.error(
            "Error loading journal:",
            error
        );
    }
}


// =====================================================
// SAVE JOURNAL
// =====================================================

saveJournalButton.addEventListener(
    "click",
    async function () {

        const userId =
            getUserId();

        if (!userId) {

            alert(
                "Please enter your name first."
            );

            return;
        }


        const selectedMood =
            document.querySelector(
                'input[name="mood"]:checked'
            );


        const mood =
            selectedMood
                ? selectedMood.value
                : null;


        const journalText =
            journalTextarea.value.trim();


        try {

            const response =
                await fetch(
                    `${API_URL}/api/journal`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            user_id:
                                userId,

                            mood:
                                mood,

                            journal_text:
                                journalText,

                            journal_date:
                                getDateString()

                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to save journal"
                );
            }


            alert(
                "Journal saved successfully 🌸"
            );

            console.log(
                "Journal saved:",
                data
            );

        } catch (error) {

            console.error(
                "Error saving journal:",
                error
            );

            alert(
                "Could not save journal."
            );
        }
    }
);


// =====================================================
// PROGRESS
// =====================================================

async function loadProgress() {

    const userId =
        getUserId();

    if (!userId) {
        return;
    }


    try {

        // Get today's tasks

        const taskResponse =
            await fetch(
                `${API_URL}/api/tasks?user_id=${userId}&date=${getDateString()}`
            );

        const tasks =
            await taskResponse.json();


        if (!taskResponse.ok) {
            return;
        }


        const totalTasks =
            tasks.length;


        const completedTasks =
            tasks.filter(
                function (task) {

                    return Number(
                        task.completed
                    ) === 1;

                }
            ).length;


        let percentage = 0;


        if (totalTasks > 0) {

            percentage =
                Math.round(
                    (completedTasks /
                        totalTasks) * 100
                );

        }


        // Current streak

        document.getElementById(
            "streak"
        ).textContent =
            completedTasks > 0 ? "1" : "0";


        // Year progress

        const today =
            new Date();


        const startOfYear =
            new Date(
                today.getFullYear(),
                0,
                1
            );


        const diff =
            today - startOfYear;


        const daysPassed =
            Math.floor(
                diff /
                (1000 * 60 * 60 * 24)
            ) + 1;


        const daysInYear =
            new Date(
                today.getFullYear() + 1,
                0,
                0
            ).getDate();


        const yearPercentage =
            Math.round(
                (daysPassed /
                    daysInYear) * 100
            );


        document.getElementById(
            "year-progress"
        ).textContent =
            `${yearPercentage}%`;


        console.log(
            `Today's task progress: ${percentage}%`
        );

    } catch (error) {

        console.error(
            "Error loading progress:",
            error
        );
    }
}


// =====================================================
// LOAD EVERYTHING
// =====================================================

async function loadAllData() {

    const userId =
        getUserId();

    if (!userId) {

        console.log(
            "No user ID found."
        );

        return;
    }


    await loadTasks(
        getDateString(),
        todayTaskList
    );


    await loadTasks(
        getTomorrowDate(),
        tomorrowTaskList
    );


    await loadGoals();


    await loadHabits();


    await loadJournal();


    await loadProgress();

}


// =====================================================
// INITIAL PAGE LOAD
// =====================================================

updateGreeting();

updateDate();

showUser();

loadAllData();