const files = ["ISBD.txt"]; // tambahkan file di sini

const app = document.getElementById("app");

// HTML awal
app.innerHTML = `
  <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 2rem auto; text-align: center;">
    <h1 style="font-size: 2rem; margin-bottom: 1rem;">📚 Flashcard App</h1>
    
    <select id="selector" style="padding: 0.5rem 1rem; font-size: 1rem; margin-bottom: 1rem;">
      <option value="">-- Pilih File --</option>
      ${files.map(f => `<option value="${f}">${f.replace(".txt", "").toUpperCase()}</option>`).join("")}
    </select>
    
    <div id="status" style="margin-bottom: 0.5rem; font-size: 0.9rem; color: #555;"></div>

    <div 
      id="flashcard" 
      style="
        background: #f9f9f9; 
        padding: 1.5rem; 
        border-radius: 12px; 
        box-shadow: 0 2px 6px rgba(0,0,0,0.1); 
        min-height: 160px; 
        margin: 1rem auto;
        cursor: pointer;
        transition: background 0.3s;
        white-space: pre-wrap;
      "
    >
      Pilih file flashcard
    </div>

    <div style="margin-top: 1rem;">
      <button id="prev" style="padding: 0.5rem 1rem; margin: 0 0.5rem; font-size: 1rem;" disabled>⬅️ Sebelumnya</button>
      <button id="next" style="padding: 0.5rem 1rem; margin: 0 0.5rem; font-size: 1rem;" disabled>Selanjutnya ➡️</button>
    </div>
  </div>
`;

let flashcards = [];
let current = 0;
let isFront = true;

const selector = document.getElementById("selector");
const flashcard = document.getElementById("flashcard");
const status = document.getElementById("status");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

selector.addEventListener("change", async (e) => {
  const file = e.target.value;
  if (!file) return;

  try {
    const text = await fetch(`/${file}`).then(r => {
      if (!r.ok) throw new Error("File tidak ditemukan.");
      return r.text();
    });

    const rawLines = text.split(/\r?\n/);
    const blocks = [];
    let currentBlock = "";

    for (let line of rawLines) {
      if (line.trim() === "") continue;
      if (line.includes("\t")) {
        currentBlock += line + "\n";
        blocks.push(currentBlock.trim());
        currentBlock = "";
      } else {
        currentBlock += line + "\n";
      }
    }

    flashcards = blocks.map(b => {
      const [front, back] = b.split("\t");
      return { front: front.trim(), back: back.trim() };
    });

    if (flashcards.length === 0) {
      flashcard.textContent = "Tidak ada flashcard yang valid.";
      status.textContent = "";
      return;
    }

    current = 0;
    isFront = true;
    updateCard();
    nextBtn.disabled = false;
    prevBtn.disabled = false;
  } catch (err) {
    flashcard.textContent = `Gagal memuat file: ${err.message}`;
    status.textContent = "";
    nextBtn.disabled = true;
    prevBtn.disabled = true;
  }
});

flashcard.addEventListener("click", () => {
  if (flashcards.length === 0) return;
  isFront = !isFront;
  updateCard();
});

nextBtn.onclick = () => {
  current = (current + 1) % flashcards.length;
  isFront = true;
  updateCard();
};

prevBtn.onclick = () => {
  current = (current - 1 + flashcards.length) % flashcards.length;
  isFront = true;
  updateCard();
};

function updateCard() {
  if (flashcards.length === 0) return;
  flashcard.textContent = isFront ? flashcards[current].front : flashcards[current].back;
  status.textContent = `Kartu ${current + 1} dari ${flashcards.length} (${isFront ? "Pertanyaan" : "Jawaban"})`;
}

