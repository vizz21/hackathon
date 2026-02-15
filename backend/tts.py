async def text_to_speech(text: str) -> bytes:
    """
    TTS placeholder - actual speech synthesis happens in browser
    Browser's Web Speech API handles the voice output
    Returns None so browser takes over
    """
    print(f"🔊 TTS text prepared for browser: {text[:50]}...")
    # Return None - browser will handle speech synthesis
    return None