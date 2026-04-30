export default function UploadDropArea({
  isDragging,
  preview,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileInput,
  styles,
  t,
}) {
  return (
    <div
      style={{
        ...styles.dropzoneShell,
        ...(isDragging ? styles.dropzoneShellDragging : {}),
      }}
    >
      <div
        style={{
          ...styles.dropzoneGlow,
          ...(isDragging ? styles.dropzoneGlowDragging : {}),
        }}
      />

      <div
        style={{
          ...styles.dropzone,
          ...(isDragging ? styles.dropzoneDragging : {}),
        }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => document.getElementById("fileInput")?.click()}
      >
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={onFileInput}
        />

        {preview ? (
          <div style={styles.previewWrap}>
            <img src={preview} alt="preview" style={styles.preview} />
          </div>
        ) : (
          <div style={styles.placeholder}>
            <div style={styles.iconOrb}>
              <span style={styles.iconEmoji}>🖼️</span>
            </div>

            <p style={styles.dropTitle}>{t.dropText}</p>
            <p style={styles.dropSub}>{t.fileTypes}</p>

            <div style={styles.badgesRow}>
              <span style={styles.fileBadge}>JPG</span>
              <span style={styles.fileBadge}>PNG</span>
              <span style={styles.fileBadge}>WEBP</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
