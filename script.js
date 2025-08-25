document.addEventListener("DOMContentLoaded", () => {
  const mealForm = document.getElementById("mealForm");
  const messageDiv = document.getElementById("message");
  const webhookUrl =
    "https://n8n-test.mehmetaktas.online/webhook-test/get-images";

  mealForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Formun varsayılan gönderimini engelle

    // Mesaj divini temizle ve gizle
    showMessage("", "");

    const formData = new FormData();

    // 1. Seçilen öğünleri al
    const selectedMeals = Array.from(
      document.querySelectorAll('input[name="meal"]:checked')
    ).map((checkbox) => checkbox.value);

    if (selectedMeals.length === 0) {
      showMessage("Lütfen en az bir öğün seçimi yapın.", "error");
      return;
    }
    formData.append("meals", JSON.stringify(selectedMeals)); // n8n'de dizi olarak alınması için JSON string'e çeviriyoruz.

    // 2. Öğün adını al (eğer girildiyse)
    const mealName = document.getElementById("mealName").value.trim();
    if (mealName) {
      formData.append("mealName", mealName);
    }

    // 3. Resmi al
    const imageInput = document.getElementById("mealImage");
    const imageFile = imageInput.files[0]; // İlk seçilen dosya

    if (!imageFile) {
      showMessage("Lütfen yüklenecek bir resim seçin.", "error");
      return;
    }

    // 'image' alanı n8n'de dosya olarak işlenecektir.
    // İkinci parametre dosya objesi, üçüncü parametre dosya adı (isteğe bağlı ama iyi pratik).
    formData.append("image", imageFile, imageFile.name);

    // n8n webhook'una verileri gönder
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData, // FormData'yı gönderirken Content-Type başlığını belirtmeye gerek yok, tarayıcı halleder.
      });

      if (response.ok) {
        // Başarılı yanıt
        const result = await response.json(); // n8n'den gelen yanıtı JSON olarak al
        showMessage("Veriler başarıyla gönderildi!", "success");
        console.log("n8n Yanıtı:", result);
        mealForm.reset(); // Formu temizle
      } else {
        // Hatalı yanıt (HTTP 4xx veya 5xx)
        const errorText = await response.text(); // Hata mesajını metin olarak al
        showMessage(
          `Veri gönderilirken bir hata oluştu: ${response.status} - ${errorText}`,
          "error"
        );
        console.error("n8n Hata Yanıtı:", errorText);
      }
    } catch (error) {
      // Ağ hatası veya fetch isteğinde problem
      showMessage(`Ağ hatası oluştu: ${error.message}`, "error");
      console.error("Fetch Hatası:", error);
    }
  });

  // Mesajları göstermek için yardımcı fonksiyon
  function showMessage(msg, type) {
    messageDiv.textContent = msg;
    messageDiv.className = `message ${type} ${msg ? "show" : ""}`; // Eğer mesaj boşsa gizle
  }
});
