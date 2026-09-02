-- 009_seed_sample_manuals.sql
-- Example manual import batch: CSC222 Game Programming with Pygame, 4 sample tasks.
-- (These are demo / seed rows, run against the Supabase SQL Editor to seed a demo instructor account.)

-- Only seed if instructor demo account exists (from 002_seed_users.sql)
DO $seed_manuals_009$
DECLARE
    _instructor_id UUID;
    _manual_id UUID;
BEGIN
    SELECT id INTO _instructor_id FROM public.users WHERE email = 'instructor@demo.com' AND role = 'instructor';
    IF _instructor_id IS NULL THEN
        RAISE NOTICE 'Demo instructor not seeded yet; skipping manual seed.';
        RETURN;
    END IF;

    -- Upsert a demo manual
    INSERT INTO public.manuals (
        instructor_id, course_code, title, description, semester,
        deadline, published, import_batch_id
    ) VALUES (
        _instructor_id,
        'CSC222',
        'Game Programming with Pygame — Lab Manual (2026/27)',
        'Introductory Pygame lab pack covering surfaces, drawing, events, and sprite movement.',
        '2026/27 Semester 1',
        NOW() + INTERVAL '16 weeks',
        TRUE,
        'seed-csc222-v1'
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO _manual_id;

    IF _manual_id IS NULL THEN
        SELECT id INTO _manual_id
          FROM public.manuals
         WHERE import_batch_id = 'seed-csc222-v1'
         LIMIT 1;
    END IF;

    -- Upsert 4 sample tasks
    INSERT INTO public.tasks (
        manual_id, order_index, title, instruction_text,
        pdf_section_label, pdf_page_start, pdf_page_end,
        language, starter_code, expected_output, points
    ) VALUES
      (_manual_id, 1,
       'Task 1.1 — Initialize a Pygame window',
       'Write a script that creates a 640x480 Pygame window with a caption and a main loop that quits on close.',
       'Section 1.2', 6, 9,
       'python',
$$import pygame

pygame.init()
screen = pygame.display.set_mode((640, 480))
pygame.display.set_caption("CSC222 — Task 1.1")

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

pygame.quit()
$$,
       NULL, 10),

      (_manual_id, 2,
       'Task 2.1 — Draw a colored rectangle',
       'Using the window from Task 1.1, fill the screen black and draw a solid red rectangle at (50, 50) sized 120x80.',
       'Section 2.1', 16, 19,
       'python',
$$import pygame

pygame.init()
screen = pygame.display.set_mode((640, 480))

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    screen.fill((0, 0, 0))
    pygame.draw.rect(screen, (255, 0, 0), pygame.Rect(50, 50, 120, 80))
    pygame.display.flip()

pygame.quit()
$$,
       NULL, 15),

      (_manual_id, 3,
       'Task 3.1 — React to arrow key presses',
       'Print LEFT / RIGHT / UP / DOWN messages inside the event loop whenever the corresponding arrow key is pressed. Quit when the window is closed.',
       'Section 3.1', 22, 27,
       'python',
$$import pygame

pygame.init()
screen = pygame.display.set_mode((640, 480))

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_LEFT:
                print("LEFT")
            elif event.key == pygame.K_RIGHT:
                print("RIGHT")
            elif event.key == pygame.K_UP:
                print("UP")
            elif event.key == pygame.K_DOWN:
                print("DOWN")

pygame.quit()
$$,
       NULL, 15),

      (_manual_id, 4,
       'Task 4.1 — Move a player rectangle with arrow keys',
       'Combine the tasks above: a black screen, one blue player rect at (300,220), 40x40, arrow keys move it 3 pixels per frame. Clamp it inside 640x480.',
       'Section 4.1', 32, 37,
       'python',
$$import pygame

pygame.init()
screen = pygame.display.set_mode((640, 480))
clock = pygame.time.Clock()

player = pygame.Rect(300, 220, 40, 40)
speed = 3

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT]  and player.left > 0:
        player.move_ip(-speed, 0)
    if keys[pygame.K_RIGHT] and player.right < 640:
        player.move_ip(speed, 0)
    if keys[pygame.K_UP]    and player.top > 0:
        player.move_ip(0, -speed)
    if keys[pygame.K_DOWN]  and player.bottom < 480:
        player.move_ip(0, speed)

    screen.fill((0, 0, 0))
    pygame.draw.rect(screen, (30, 120, 255), player)
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
$$,
       NULL, 20)
    ON CONFLICT (manual_id, order_index) DO NOTHING;
END $seed_manuals_009$;
