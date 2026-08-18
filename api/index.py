"""Vercel serverless entry point for the HR Payroll Dashboard.

Imports the Flask app from the project root so the @vercel/python builder
can wrap it as a WSGI callable.
"""
from app import app

# @vercel/python exposes a module-level WSGI callable named `app`
# (already defined by the import). `handler` is an accepted alias.
handler = app