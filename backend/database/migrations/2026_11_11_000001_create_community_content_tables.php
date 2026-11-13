<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_contents', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organizer_id')->constrained();
            $table->string('type', 16);
            $table->string('slug', 160);
            $table->string('title', 200);
            $table->text('summary')->nullable();
            $table->text('body');
            $table->foreignId('cover_image_id')->nullable()->constrained('images')->nullOnDelete();
            $table->string('status', 16)->default('DRAFT');
            $table->timestampTz('published_at')->nullable();
            $table->string('seo_title', 200)->nullable();
            $table->string('seo_description', 320)->nullable();
            $table->timestampsTz();
            $table->unique(['organizer_id', 'type', 'slug']);
            $table->index(['organizer_id', 'type', 'status', 'published_at'], 'community_publication_index');
        });

        Schema::create('community_contact_submissions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('organizer_id')->constrained();
            $table->string('name', 100);
            $table->string('email', 254);
            $table->string('subject', 200);
            $table->text('message');
            $table->timestampTz('read_at')->nullable();
            $table->timestampsTz();
            $table->index(['organizer_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_contact_submissions');
        Schema::dropIfExists('community_contents');
    }
};
