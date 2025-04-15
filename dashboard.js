
function initData() {
  const existing = localStorage.getItem("usersData");
  if (!existing) {
    const sampleData = {
      users: [
        {
          id: 1,
          username: "john_doe",
          email: "john@example.com",
          password: "johnexample",
          boards: [],
        },
      ],
    };
    localStorage.setItem("usersData", JSON.stringify(sampleData));
  }
}

function getCurrentUser() {
  const currentUserId = parseInt(localStorage.getItem("currentUserId"));
  const usersData = JSON.parse(localStorage.getItem("usersData")) || { users: [] };
  return usersData.users.find((user) => user.id === currentUserId);
}

function saveCurrentUser(updatedUser) {
  const usersData = JSON.parse(localStorage.getItem("usersData")) || { users: [] };
  const updatedUsers = usersData.users.map((user) =>
    user.id === updatedUser.id ? updatedUser : user
  );
  localStorage.setItem("usersData", JSON.stringify({ users: updatedUsers }));
}

function renderBoard() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const allBoards = document.getElementById("allBoards");
  const starredBoards = document.getElementById("starredBoards");
  allBoards.innerHTML = "";
  starredBoards.innerHTML = "";

  currentUser.boards.forEach((board) => {
    const boardDiv = document.createElement("div");
    boardDiv.classList.add("board");
    boardDiv.setAttribute("data-id", board.id);
    boardDiv.style.cursor = "pointer";

    if (board.backdrop) {
      boardDiv.style.backgroundImage = `url(${board.backdrop})`;
    } else if (board.color) {
      boardDiv.style.backgroundColor = board.color;
    }

    boardDiv.innerHTML = `
      ${board.title}
      <button class="fill btn openEditModal" data-id="${board.id}">Edit this board</button>
      <div class="after" style="background-image: url(${board.backdrop_gif})"></div>
    `;

    boardDiv.addEventListener("click", (e) => {
      if (!e.target.classList.contains("openEditModal")) {
        window.location.href = `boardLayout.html?boardId=${board.id}`;
      }
    });

    allBoards.appendChild(boardDiv);

    if (board.is_starred) {
      const starredDiv = boardDiv.cloneNode(true);
      starredBoards.appendChild(starredDiv);
    }
  });
}

let editingBoardId = null;
let selectedBg = null;
let selectedColor = null;

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    Swal.fire({ icon: "error", title: "Session expired", text: "Please sign in again" })
      .then(() => {
        localStorage.removeItem("currentUserId");
        window.location.href = "sign-in.html";
      });
    return;
  }

  renderBoard();

  const openBtn = document.getElementById("openCreateBoard");
  const modal = document.getElementById("createBoardModal");
  const editModal = document.getElementById("updateBoardModal");
  const closeBtn = document.getElementById("closeCreateModal");
  const closeEditBtn = document.getElementById("closeEditModal");
  const overlay = document.getElementById("overlay");

  const boardTitle = document.getElementById("boardTitle");
  const editeTitle = document.getElementById("editBoardTitle");
  const createBtn = document.getElementById("createBtn");
  const saveBtn = document.getElementById("saveEditModal");

  const clearSelected = (className) => {
    document.querySelectorAll(`.${className}`).forEach((el) => el.classList.remove("selected"));
  };

  document.querySelectorAll(".bg-option").forEach((img) => {
    img.addEventListener("click", () => {
      clearSelected("bg-option");
      clearSelected("color-option");
      img.classList.add("selected");
      selectedBg = img.getAttribute("src");
      selectedColor = null;
    });
  });

  document.querySelectorAll(".color-option").forEach((div) => {
    div.addEventListener("click", () => {
      clearSelected("color-option");
      clearSelected("bg-option");
      div.classList.add("selected");
      selectedColor = div.style.backgroundColor;
      selectedBg = null;
    });
  });

  createBtn.addEventListener("click", () => {
    const title = boardTitle.value.trim();
    if (!title) return Swal.fire({ icon: "error", title: "Please enter a title" });
    if (!selectedBg && !selectedColor)
      return Swal.fire({ icon: "error", title: "Please select background" });

    const newBoard = {
      id: Date.now(),
      title,
      description: "",
      backdrop: selectedBg || "",
      backdrop_gif: selectedBg ? selectedBg.replace(".jpg", "_gif.gif") : "",
      color: selectedColor || "",
      is_starred: false,
      lists: [],
    };

    currentUser.boards.push(newBoard);
    saveCurrentUser(currentUser);
    renderBoard();
    boardTitle.value = "";
    selectedBg = null;
    selectedColor = null;
    closeModal();
  });

  saveBtn.addEventListener("click", () => {
    const updateTitle = editeTitle.value.trim();
    const boardIndex = currentUser.boards.findIndex((b) => b.id === editingBoardId);
    if (boardIndex !== -1) {
      const board = currentUser.boards[boardIndex];
      board.title = updateTitle;
      board.backdrop = selectedBg || "";
      board.backdrop_gif = selectedBg ? selectedBg.replace(".jpg", "_gif.gif") : "";
      board.color = selectedColor || "";
      saveCurrentUser(currentUser);
      renderBoard();
    }
    editeTitle.value = "";
    selectedBg = null;
    selectedColor = null;
    closeEditModal();
  });

  const openModal = () => {
    modal.classList.add("show");
    overlay.classList.add("show");
    document.body.classList.add("open-modal");
  };

  const closeModal = () => {
    modal.classList.remove("show");
    overlay.classList.remove("show");
    document.body.classList.remove("open-modal");
  };

  const openEditModal = () => {
    editModal.classList.add("show");
    overlay.classList.add("show");
    document.body.classList.add("open-modal");
  };

  const closeEditModal = () => {
    editModal.classList.remove("show");
    overlay.classList.remove("show");
    document.body.classList.remove("open-modal");
  };

  openBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0 });
    selectedBg = null;
    selectedColor = null;
    clearSelected("bg-option");
    clearSelected("color-option");
    openModal();
  });

  closeBtn.addEventListener("click", closeModal);
  closeEditBtn.addEventListener("click", closeEditModal);
  overlay.addEventListener("click", () => {
    closeModal();
    closeEditModal();
  });

  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("openEditModal")) {
      editingBoardId = parseInt(e.target.dataset.id);
      const board = currentUser.boards.find((b) => b.id === editingBoardId);
      if (board) {
        editeTitle.value = board.title;
        clearSelected("bg-option");
        clearSelected("color-option");
        if (board.backdrop) {
          const img = [...document.querySelectorAll(".bg-option")].find(
            (img) => img.src.includes(board.backdrop)
          );
          if (img) img.classList.add("selected");
          selectedBg = board.backdrop;
        } else if (board.color) {
          const colorDiv = [...document.querySelectorAll(".color-option")].find(
            (div) => div.style.backgroundColor === board.color
          );
          if (colorDiv) colorDiv.classList.add("selected");
          selectedColor = board.color;
        }
      }
      openEditModal();
    }
  });
});
