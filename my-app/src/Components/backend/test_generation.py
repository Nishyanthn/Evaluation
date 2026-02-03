# test_generation.py
# LLM-based test case generation utilities

from typing import List, Dict
from fastapi import UploadFile
import io
import re
import json


def parse_text_file(content: bytes) -> str:
    """Parse TXT file"""
    try:
        return content.decode('utf-8')
    except UnicodeDecodeError:
        return content.decode('latin-1')


def parse_markdown_file(content: bytes) -> str:
    """Parse Markdown file"""
    return parse_text_file(content)


def parse_pdf_file(content: bytes) -> str:
    """Parse PDF file - simple text extraction"""
    try:
        import PyPDF2
        pdf_file = io.BytesIO(content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except ImportError:
        return "Error: PyPDF2 library not installed. Install with: pip install PyPDF2"
    except Exception as e:
        return f"Error parsing PDF: {str(e)}"


async def parse_kb_files(files: List[UploadFile]) -> str:
    """Parse all KB files and return combined text"""
    combined_text = ""

    for file in files:
        content = await file.read()
        filename = file.filename.lower()

        print(f"📄 Parsing file: {file.filename}")

        if filename.endswith('.txt'):
            text = parse_text_file(content)
        elif filename.endswith('.md'):
            text = parse_markdown_file(content)
        elif filename.endswith('.pdf'):
            text = parse_pdf_file(content)
        else:
            print(f"⚠️ Unsupported file type: {file.filename}")
            continue

        combined_text += f"\n\n=== {file.filename} ===\n{text}\n"

    return combined_text.strip()


def chunk_text(text: str, max_chunk_size: int = 3000) -> List[str]:
    """Split text into chunks to avoid token limits"""
    # Split by paragraphs first
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""

    for para in paragraphs:
        if len(current_chunk) + len(para) < max_chunk_size:
            current_chunk += para + "\n\n"
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = para + "\n\n"

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks


async def generate_test_cases_with_llm(
    kb_content: str,
    num_test_cases: int,
    custom_prompt: str,
    model_name: str,
    evaluation_model,
    token_counter=None
) -> List[Dict[str, str]]:
    """Generate test cases using LLM based on KB content"""

    if not evaluation_model:
        raise Exception("Evaluation model not initialized")

    # Chunk KB content if too large
    kb_chunks = chunk_text(kb_content, max_chunk_size=4000)

    print(f"\n{'='*70}")
    print(f"🤖 GENERATING TEST CASES WITH LLM")
    print(f"{'='*70}")
    print(f"KB Chunks: {len(kb_chunks)}")
    print(f"Test Cases to Generate: {num_test_cases}")
    print(f"Model: {model_name}")
    print(f"Token Tracking: {'Enabled' if token_counter else 'Disabled'}")
    print(f"{'='*70}\n")

    all_test_cases = []
    cases_per_batch = 5
    num_batches = (num_test_cases + cases_per_batch - 1) // cases_per_batch

    for batch_idx in range(num_batches):
        # Calculate how many cases to generate in this batch
        remaining_cases = num_test_cases - len(all_test_cases)
        batch_size = min(cases_per_batch, remaining_cases)

        # Rotate through KB chunks for diversity
        chunk_idx = batch_idx % len(kb_chunks)
        kb_context = kb_chunks[chunk_idx] if kb_chunks else "No KB content provided"

        # Build the generation prompt
        system_prompt = f"""You are an expert QA test case generator. Your task is to generate diverse and realistic test cases based on the provided knowledge base content.

KNOWLEDGE BASE CONTENT:
{kb_context}

INSTRUCTIONS:
1. Generate {batch_size} diverse test cases
2. Each test case should have:
   - user_query: A realistic question or query a user might ask
   - expected_response: The accurate answer based on the KB content
   - category: The topic/category of the test case

3. Make queries diverse - mix simple, complex, edge cases
4. Base answers ONLY on the KB content provided
5. Categories should reflect KB topics (e.g., "Product Info", "Technical", "Pricing", etc.)

{f"ADDITIONAL REQUIREMENTS: {custom_prompt}" if custom_prompt else ""}

OUTPUT FORMAT:
Return a JSON array with exactly {batch_size} test cases. Each object must have:
- user_query (string)
- expected_response (string)
- category (string)

Example:
[
  {{
    "user_query": "What is the product warranty period?",
    "expected_response": "The product comes with a 2-year manufacturer warranty covering defects.",
    "category": "Warranty"
  }}
]
"""

        try:
            print(f"   📝 Generating batch {batch_idx + 1}/{num_batches} ({batch_size} cases)...")

            # Call LLM
            response_content = await evaluation_model.a_generate(
                prompt=system_prompt,
                schema=None
            )

            # Parse JSON response
            # Remove markdown code blocks if present
            response_text = str(response_content).strip()
            if response_text.startswith("```"):
                response_text = re.sub(r'^```json?\s*', '', response_text)
                response_text = re.sub(r'\s*```$', '', response_text)

            batch_cases = json.loads(response_text)

            if isinstance(batch_cases, list):
                all_test_cases.extend(batch_cases)
                print(f"   ✅ Generated {len(batch_cases)} cases (Total: {len(all_test_cases)})")

                # Print token usage after each batch
                if token_counter:
                    print(f"   📊 Tokens used so far: {token_counter.total_tokens:,} (prompt: {token_counter.prompt_tokens:,}, completion: {token_counter.completion_tokens:,})")
            else:
                print(f"   ⚠️ Unexpected response format")

        except Exception as e:
            print(f"   ❌ Error in batch {batch_idx + 1}: {e}")
            # Continue with next batch
            continue

    print(f"\n{'='*70}")
    print(f"✅ GENERATION COMPLETE: {len(all_test_cases)} test cases")
    print(f"{'='*70}\n")

    return all_test_cases[:num_test_cases]  # Trim to exact number requested
