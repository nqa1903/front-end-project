document.addEventListener("DOMContentLoaded", () => {
  const openFilterBtn = document.getElementById("openFilterModal");
  const filterModal = document.getElementById("filterModal");
  const closeFilterBtn = document.getElementById("closeFilterModal");
  const cardDetail = document.getElementById("cardDetail");

  const openFilterModal = () => {
    filterModal.classList.add("show");
  };

  const closeFilterModal = () => {
    filterModal.classList.remove("show");
  };

  openFilterBtn.addEventListener("click", openFilterModal);
  closeFilterBtn.addEventListener("click", closeFilterModal);

  const boardContent = document.getElementById("boardContent");
  const addListBtn = document.getElementById("addListBtn");

  addListBtn.addEventListener("click", () => {
    addListBtn.style.display = "none";

    const formDiv = document.createElement("div");
    formDiv.className = "add-list-form board-list";
    formDiv.innerHTML = `
      <div class="input-wrapper">
        <input type="text" name="nameList" id="nameList" class="input" placeholder=" " />
        <label for="nameList" class="label">Enter list name</label>
      </div>
      <div class="add-list-actions">
        <button class="add-list-btn btn fill" id="submitListBtn">Add list</button>
        <i class="fa-regular fa-rectangle-xmark close-add-list" id="closeListBtn"></i>
      </div>
    `;
    boardContent.appendChild(formDiv);

    const submitListBtn = document.getElementById("submitListBtn");
    const closeListBtn = document.getElementById("closeListBtn");

    submitListBtn.addEventListener("click", () => {
      const listName = document.getElementById("nameList").value.trim();
      if (listName === "") {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "List name can't be empty",
        });
        return;
      }

      const listDiv = document.createElement("div");
      listDiv.className = "board-list";
      listDiv.innerHTML = `
        <div class="list-header">
          <p class="list-title">${listName}</p>
          <div class="list-actions">
            <i class="fas fa-compress-alt"></i>
            <i class="fas fa-ellipsis-h"></i>
          </div>
        </div>
        <div class="task-container"></div>
        <div class="add-task">
          <p style="cursor: pointer" class="add-card-btn">+ Add a card</p>
          <i class="far fa-edit edit-card-btn"></i>
        </div>
      `;
      boardContent.insertBefore(listDiv, addListBtn);
      formDiv.remove();
      addListBtn.style.display = "inline-block";

      const addCardBtn = listDiv.querySelector(".add-card-btn");
      const editCardBtn = listDiv.querySelector(".edit-card-btn");
      const taskContainer = listDiv.querySelector(".task-container");

      addCardBtn.addEventListener("click", () => {
        addCardBtn.style.display = "none";
        editCardBtn.style.display = "none"; 

        const taskInputDiv = document.createElement("div");
        taskInputDiv.className = "input-wrapper";
        taskInputDiv.innerHTML = `
          <input type="text" class="input" placeholder=" " />
          <label class="label">Enter a title</label>
          <div class="add-list-actions">
            <button class="add-list-btn btn fill">Add Card</button>
            <i class="fa-regular fa-rectangle-xmark close-add-list"></i>
          </div>
        `;

        taskContainer.appendChild(taskInputDiv);

        const input = taskInputDiv.querySelector("input");
        const addBtn = taskInputDiv.querySelector("button");
        const closeBtn = taskInputDiv.querySelector("i");

        addBtn.addEventListener("click", () => {
          const taskName = input.value.trim();
          if (taskName !== "") {
            const task = document.createElement("p");
            task.className = "task-item";
            task.innerHTML =`
              ${taskName}
            `
            taskContainer.insertBefore(task, taskInputDiv);
            taskInputDiv.remove();
            addCardBtn.style.display = "inline-block";
            editCardBtn.style.display = "inline-block";
          } else {
            Swal.fire({
              icon: "error",
              title: "Oops...",
              text: "Task name can't be empty",
            });
          }
        });
        task.addEventListener("click" , () =>{
          cardDetail.style.display = "block";
        })
        closeBtn.addEventListener("click", () => {
          taskInputDiv.remove();
          addCardBtn.style.display = "inline-block";
          editCardBtn.style.display = "inline-block";
        });
      });
    });

    closeListBtn.addEventListener("click", () => {
      formDiv.remove();
      addListBtn.style.display = "inline-block";
      editCardBtn.style.display = "inline-block";
    });
  });
});

